/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapView } from "@here/harp-mapview";
import { APIFormat, OmvDataSource } from "@here/harp-omv-datasource";
import { OmvTileDecoder } from "@here/harp-omv-datasource/lib/OmvDecoder";
import { accessToken } from "../config";
import MapHandler from "./index";

class MapHighlighter {
    private m_mapView: MapView | null = null;
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
                    color: "red"
                }
            },
            {
                when: "$geometryType == 'polygon'",
                technique: "fill",
                attr: {
                    transparent: true,
                    color: "red"
                }
            },
            {
                when: "$geometryType == 'point'",
                technique: "circles",
                attr: {
                    color: "red",
                    size: 10
                }
            }
        ]
    };

    constructor() {
        this.m_highlightDataSource = new OmvDataSource({
            name: "decorations",
            baseUrl: "https://xyz.api.here.com/tiles/herebase.02",
            apiFormat: APIFormat.XYZOMV,
            styleSetName: "tilezen",
            maxZoomLevel: 17,
            authenticationCode: accessToken,
            decoder: new OmvTileDecoder()
        });
        this.m_highlightDataSource.addTileBackground = false;
    }

    highlight = async (newWhenCondition: string = "0") => {
        if (!this.m_mapView) {
            this.m_mapView = MapHandler.mapView as MapView;
            this.m_mapView.addDataSource(this.m_highlightDataSource).then(() => {
                this.m_highlightDataSource.setStyleSet([this.m_style]);
            });
        }

        if (this.m_activeWhereParam !== newWhenCondition) {
            this.m_style.when = newWhenCondition;
            this.m_activeWhereParam = newWhenCondition;
            this.m_highlightDataSource.setStyleSet([this.m_style]);

            setTimeout(() => {
                this.m_mapView!.clearTileCache(this.m_highlightDataSource.name);
                this.m_mapView!.update();
            }, 1000);
        }
    };
}

export default new MapHighlighter();
