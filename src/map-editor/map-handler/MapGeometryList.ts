/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { MapEnv } from "@here/harp-datasource-protocol/index-decoder";
import { GeoCoordinates, mercatorProjection, webMercatorTilingScheme } from "@here/harp-geoutils";
import { MapView } from "@here/harp-mapview";
import { DataProvider } from "@here/harp-mapview-decoder";
import { VectorTileDataSource } from "@here/harp-vectortile-datasource";
import { OmvDataAdapter } from "@here/harp-vectortile-datasource/lib/adapters/omv/OmvDataAdapter";

import { DecodeInfo } from "@here/harp-vectortile-datasource/lib/DecodeInfo";
import {
    IGeometryProcessor,
    ILineGeometry,
    IPolygonGeometry,
} from "@here/harp-vectortile-datasource/lib/IGeometryProcessor";
import { Vector2 } from "three";

//

let dataProvider: DataProvider;
export let geometryList: any = {};

class Decoder implements IGeometryProcessor {
    processLineFeature(
        layerName: string,
        layerExtents: number,
        geometry: ILineGeometry[],
        env: MapEnv,
        storageLevel: number
    ) {
        this.dump("line", layerName, env);
    }

    processPointFeature(
        layerName: string,
        layerExtents: number,
        geometry: Vector2[],
        env: MapEnv,
        storageLevel: number
    ) {
        this.dump("point", layerName, env);
    }

    processPolygonFeature(
        layerName: string,
        layerExtents: number,
        geometry: IPolygonGeometry[],
        env: MapEnv,
        storageLevel: number
    ) {
        this.dump("polygon", layerName, env);
    }

    private dump(type: string, layer: string, env: MapEnv) {
        const level = (env.entries.$level as string) + " level";
        const kind = env.entries.kind as string;
        geometryList[layer] = geometryList[layer] || {};
        geometryList[layer][type] = geometryList[layer][type] || {};
        geometryList[layer][type][level] = geometryList[layer][type][level] || {};
        geometryList[layer][type][level][kind] = geometryList[layer][type][level][kind] || [];
        geometryList[layer][type][level][kind].push(env.entries);
    }
}

/**
 *
 * @param geoPoint The geo coordinates of a point of the tile.
 * @param level The storage level.
 * @param projection The target projection used by the map view.
 * @param storageLevelOffset The storage level offset.
 */

async function dumpTile(
    geoPoint: GeoCoordinates,
    level: number,
    projection = mercatorProjection,
    storageLevelOffset = 0
) {
    const tileKey = webMercatorTilingScheme.getTileKey(geoPoint, level);

    if (!tileKey) {
        throw new Error("failed to get tile");
    }

    geometryList = {};
    const buffer = (await dataProvider.getTile(tileKey)) as ArrayBuffer;
    const decoder = new Decoder();
    const adapter = new OmvDataAdapter(decoder);

    const decodeInfo = new DecodeInfo("dump", projection, tileKey, storageLevelOffset);
    adapter.process(buffer, decodeInfo);
}

export const getGeometryData = (mapView: MapView, dataSource: VectorTileDataSource): void => {
    const geoPoint = new GeoCoordinates(
        mapView.geoCenter.latitude % 180,
        mapView.geoCenter.longitude % 180
    );
    dataProvider = dataProvider || dataSource.dataProvider();

    dumpTile(geoPoint, Math.min(mapView.storageLevel, 15)).catch((err) => {
        // tslint:disable-next-line
        console.log(err);
    });
};
