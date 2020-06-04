/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { APIFormat, OmvDataSource } from "@here/harp-omv-datasource";
import { OmvTileDecoder } from "@here/harp-omv-datasource/lib/OmvDecoder";
import { accessToken } from "../config";
import settings from "../Settings";
import MapHandler from "./index";

class MapHighlighter {
    private m_activeWhereParam = "";
    private m_highlightDataSource: OmvDataSource;

    private m_style: any = {
        when: "0",
        renderOrder: Number.MAX_SAFE_INTEGER,
        styles: [
            {
                when: "$geometryType == 'line'",
                technique: "line",
                attr: {
                    transparent: true,
                    color: "red",
                },
            },
            {
                when: "$geometryType == 'polygon'",
                technique: "fill",
                attr: {
                    transparent: true,
                    color: "red",
                },
            },
            {
                when: "$geometryType == 'point'",
                technique: "circles",
                attr: {
                    color: "red",
                    size: 10,
                },
            },
        ],
    };

    constructor() {
        this.m_highlightDataSource = new OmvDataSource({
            name: "decorations",
            baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
            apiFormat: APIFormat.XYZOMV,
            styleSetName: "tilezen",
            maxZoomLevel: 17,
            authenticationCode: accessToken,
            decoder: new OmvTileDecoder(),
        });
    }

    highlight = async (newWhenCondition: string) => {
        const editorCurrentStyle = settings.get("editorCurrentStyle");

        if (editorCurrentStyle === null || MapHandler.mapView === null) {
            return;
        }

        if (MapHandler.mapView.getDataSourceByName(this.m_highlightDataSource.name) === undefined) {
            await MapHandler.mapView.addDataSource(this.m_highlightDataSource);

            this.m_highlightDataSource.styleSetName = editorCurrentStyle;
            this.m_highlightDataSource.setStyleSet([this.m_style]);
        }

        if (this.m_activeWhereParam !== newWhenCondition) {
            this.m_style.when = this.m_activeWhereParam = newWhenCondition || "0";
            this.m_highlightDataSource.setStyleSet([this.m_style]);

            MapHandler.mapView.clearTileCache(this.m_highlightDataSource.name);
            MapHandler.mapView.update();
        }
    };
}

export default new MapHighlighter();
