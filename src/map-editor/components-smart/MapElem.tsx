/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { MapControlsUI } from "@here/harp-map-controls";
import * as React from "react";
import { Side } from "../../types";
import Component, { SettingsState } from "../Component";
import MapHandler from "../map-handler";
import Info from "./Info";

/**
 * Responsible for managing DOM element of the map.
 */
export default class extends Component<any, SettingsState> {
    private m_elemMap: HTMLDivElement | null = null;
    private m_elemCopyright: HTMLDivElement | null = null;
    private m_controlsContainer: HTMLDivElement | null = null;
    private m_mapControlsUI: MapControlsUI | null = null;

    private onMapRemoved: () => void;
    private onMapCreated: () => void;

    constructor(props: {}) {
        super(props);

        this.state = {
            settings: {},
            store: {}
        };

        this.onMapRemoved = () => {
            if (this.m_mapControlsUI !== null) {
                // TODO: dispose to avoid memory leak. Uncomment next line after next release.
                // this.m_mapControlsUI.dispose();
                this.m_mapControlsUI.domElement.remove();
            }
        };

        this.onMapCreated = () => {
            if (this.m_controlsContainer === null || this.m_elemCopyright === null) {
                throw new Error();
            }

            if (MapHandler.elem === null) {
                const elem = document.querySelector("#map-container .map") as HTMLCanvasElement;
                if (elem === null) {
                    throw new Error();
                }
                MapHandler.init(elem, this.m_elemCopyright);
            } else {
                const elem = document.getElementById("map-container");
                if (elem === null) {
                    throw new Error();
                }
                const canvas = elem.querySelector("canvas");
                if (canvas !== null) {
                    elem.removeChild(canvas);
                }
                elem.appendChild(MapHandler.elem);
            }

            if (MapHandler.controls === null || MapHandler.mapView === null) {
                throw new Error();
            }

            this.m_mapControlsUI = new MapControlsUI(MapHandler.controls, { zoomLevel: "input" });
            this.m_controlsContainer.appendChild(this.m_mapControlsUI.domElement);
        };
    }

    componentDidMount() {
        this.connectSettings(["editorTabVisible", "editorTabSize", "editorTabSide"]);

        this.setPadding();

        MapHandler.on("mapCreated", this.onMapCreated);
        MapHandler.on("mapRemoved", this.onMapRemoved);

        window.addEventListener("resize", () => {
            this.setPadding();
        });

        this.onMapCreated();
    }

    render() {
        this.setPadding();

        return (
            <div
                id="map-container"
                ref={node => (this.m_elemMap = node)}
                className={this.state.settings.editorTabSide as string}
            >
                <div id="controls-container" ref={node => (this.m_controlsContainer = node)} />
                <canvas className="map" />
                <div id="copyright" ref={node => (this.m_elemCopyright = node)} />
                <Info />
            </div>
        );
    }

    private setPadding() {
        if (this.m_elemMap === null) {
            return;
        }

        const { settings } = this.state;
        const editorTabSize = settings.editorTabSize as number;
        const editorTabVisible = settings.editorTabVisible as boolean;
        const editorTabSide = settings.editorTabSide as Side;

        this.m_elemMap.style.padding = "0";
        this.m_controlsContainer!.style.margin = "0";
        const react = this.m_elemMap.getBoundingClientRect();

        if (editorTabVisible && editorTabSide !== Side.DeTouch) {
            switch (editorTabSide) {
                case Side.Left:
                    this.m_elemMap.style.paddingLeft = `${editorTabSize}px`;
                    MapHandler.resize(react.width - editorTabSize, react.height);
                    break;
                case Side.Right:
                    this.m_elemMap.style.paddingRight = `${editorTabSize}px`;
                    MapHandler.resize(react.width - editorTabSize, react.height);
                    break;
                case Side.Top:
                    this.m_elemMap.style.paddingTop = `${editorTabSize}px`;
                    this.m_controlsContainer!.style.marginTop = `${editorTabSize}px`;
                    MapHandler.resize(react.width, react.height - editorTabSize);
                    break;
                case Side.Bottom:
                    this.m_elemMap.style.paddingBottom = `${editorTabSize}px`;
                    this.m_controlsContainer!.style.marginBottom = `${editorTabSize}px`;
                    MapHandler.resize(react.width, react.height - editorTabSize);
                    break;
            }
        } else {
            MapHandler.resize(react.width, react.height);
        }
    }
}
