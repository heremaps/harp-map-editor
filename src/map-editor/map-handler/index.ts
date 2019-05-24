/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { Theme } from "@here/harp-datasource-protocol";
import { MapControls } from "@here/harp-map-controls";
import {
    CopyrightElementHandler,
    CopyrightInfo,
    MapView,
    MapViewEventNames
} from "@here/harp-mapview";
import { APIFormat, OmvDataSource } from "@here/harp-omv-datasource";
import { OmvTileDecoder } from "@here/harp-omv-datasource/lib/OmvDecoder";
import { LoggerManager } from "@here/harp-utils";
import { EventEmitter } from "events";
import { throttle } from "throttle-debounce";
import settings from "../Settings";
import textEditor from "../TextEditor";
import { getGeometryData } from './MapGeometryList';
import MapViewState from "./MapViewState";

export const logger = LoggerManager.instance.create("MapHandler");

/**
 * Manages the Map.
 */
class MapHandler extends EventEmitter {
    get elem() {
        return this.m_canvasElem;
    }

    get controls() {
        if (this.m_controls === null) {
            throw new Error();
        }
        return this.m_controls;
    }

    get state() {
        return this.m_mapViewState;
    }

    get mapView() {
        if (this.m_mapView === null) {
            throw new Error();
        }
        return this.m_mapView;
    }
    private m_canvasElem: HTMLCanvasElement | null = null;
    private m_copyrightElem: HTMLDivElement | null = null;
    /**
     * The map instance
     */
    private m_mapView: MapView | null = null;
    private m_controls: MapControls | null = null;
    /**
     * Represents the position and orientation of the camera.
     */
    private m_mapViewState: MapViewState = MapViewState.fromString(
        settings.get("editorMapViewState")
    );
    /**
     * The current data source for the camera.
     */
    private m_datasource: OmvDataSource | null = null;
    private m_copyrights: CopyrightInfo[];

    /**
     * Updates map theme and clears the map cache.
     */
    private rebuildMap: () => void;

    constructor() {
        super();

        const hereCopyrightInfo: CopyrightInfo = {
            id: "here.com",
            year: new Date().getFullYear(),
            label: "HERE",
            link: "https://legal.here.com/terms"
        };

        this.rebuildMap = () => {
            const source = textEditor.getValue();
            try {
                const themeData = JSON.parse(source) as Theme;
                this.m_mapView!.theme = themeData;
                this.setDatasourceAndStyle(settings.get("editorCurrentStyle"));
                this.m_mapView!.clearTileCache();
                this.m_mapView!.update();
            } catch (error) {
                /* */
            }
        };

        this.m_copyrights = [hereCopyrightInfo];
    }

    /**
     * Initialize MapHandler when the page is ready.
     */
    init(canvas: HTMLCanvasElement, copyrightElem: HTMLDivElement) {
        this.m_canvasElem = canvas;
        this.m_copyrightElem = copyrightElem;

        let theme;

        try {
            const src = textEditor.getValue();
            theme = JSON.parse(src) as Theme;
        } catch (err) {
            logger.error(err);
        }

        this.m_mapView = new MapView({
            canvas,
            decoderUrl: "decoder.bundle.js",
            theme
        });

        CopyrightElementHandler.install(this.m_copyrightElem, this.m_mapView);

        this.setDatasourceAndStyle(settings.get("editorCurrentStyle"));

        this.m_controls = new MapControls(this.m_mapView);
        this.m_controls.enabled = true;

        this.m_controls.setRotation(this.m_mapViewState.yaw, this.m_mapViewState.pitch);

        this.m_mapView.setCameraGeolocationAndZoom(
            this.m_mapViewState.center,
            this.m_mapViewState.zoom
        );

        this.m_mapView.addEventListener(
            MapViewEventNames.Render,
            throttle(500, () => {
                const state = new MapViewState(
                    this.m_mapView!.zoomLevel,
                    this.m_mapView!.geoCenter,
                    this.m_controls!.yawPitchRoll.yaw,
                    this.m_controls!.yawPitchRoll.pitch
                );
                this.m_mapViewState = state;
                settings.set("editorMapViewState", state.toString());
            })
        );

        this.m_mapView.addEventListener(
            MapViewEventNames.MovementFinished,
            () => {

                getGeometryData( this.m_mapView as MapView, this.m_datasource as OmvDataSource );

            }
        );

        settings.on("setting:textEditor:sourceCode", this.rebuildMap);
        settings.on("setting:editorCurrentStyle", this.rebuildMap);

        this.emit("init");
    }

    /**
     * Return userData of the clicked element;
     */
    intersect(event: MouseEvent) {
        const rect = this.m_canvasElem!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const intersectionResults = this.m_mapView!.intersectMapObjects(x, y);
        if (!intersectionResults || intersectionResults.length === 0) {
            return null;
        }

        return intersectionResults[0].intersection!.object.userData;
    }

    resize(width: number, height: number) {
        if (this.m_mapView === null) {
            return;
        }
        this.m_mapView.resize(width, height);
    }

    /**
     * Replacing the map data source with each map theme update for having the appropriate
     * styleSetName on the datasource.
     */
    private setDatasourceAndStyle(style: string) {
        if (this.m_datasource !== null && this.m_mapView) {
            this.m_mapView.removeDataSource(this.m_datasource);
        }

        this.m_datasource = new OmvDataSource({
            baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
            apiFormat: APIFormat.XYZOMV,
            styleSetName: style === "" ? undefined : style,
            maxZoomLevel: 17,
            authenticationCode: "AYlqpxvwl7C8tSVG22lX2lg",
            copyrightInfo: this.m_copyrights,
            decoder: new OmvTileDecoder()
        });

        if (this.m_mapView !== null) {
            this.m_mapView.addDataSource(this.m_datasource);
        }
    }
}

export default new MapHandler();
