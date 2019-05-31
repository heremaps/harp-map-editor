import { MapEnv } from "@here/harp-datasource-protocol/index-decoder";
import { GeoCoordinates, webMercatorTilingScheme } from "@here/harp-geoutils";
import { MapView } from "@here/harp-mapview";
import { DataProvider } from "@here/harp-mapview-decoder";
import { OmvDataSource } from "@here/harp-omv-datasource";
import { OmvProtobufDataAdapter } from "@here/harp-omv-datasource/lib/OmvData";

import {
    IGeometryProcessor,
    ILineGeometry,
    IPolygonGeometry
} from "@here/harp-omv-datasource/lib/IGeometryProcessor";

//

let dataProvider: DataProvider;
export let geometryList: any = {};

class Decoder implements IGeometryProcessor {
    processLineFeature(layer: string, geometry: ILineGeometry[], env: MapEnv): void {
        this.dump("line", layer, env);
    }

    processPointFeature(layer: string, geometry: GeoCoordinates[], env: MapEnv): void {
        this.dump("point", layer, env);
    }

    processPolygonFeature(layer: string, polygons: IPolygonGeometry[], env: MapEnv): void {
        this.dump("polygon", layer, env);
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
 */

async function dumpTile(geoPoint: GeoCoordinates, level: number) {
    const tileKey = webMercatorTilingScheme.getTileKey(geoPoint, level);

    if (!tileKey) {
        throw new Error("failed to get tile");
    }

    geometryList = {};
    const geoBox = webMercatorTilingScheme.getGeoBox(tileKey);
    const buffer = (await dataProvider.getTile(tileKey)) as ArrayBuffer;
    const decoder = new Decoder();
    const adapter = new OmvProtobufDataAdapter(decoder);

    adapter.process(buffer, tileKey, geoBox);
}

export const getGeometryData = (mapView: MapView, dataSource: OmvDataSource): void => {
    const geoPoint = new GeoCoordinates(
        mapView.geoCenter.latitude % 180,
        mapView.geoCenter.longitude % 180
    );
    dataProvider = dataProvider || dataSource.dataProvider();

    dumpTile(geoPoint, Math.min(mapView.storageLevel, 15)).catch(err => {
        // tslint:disable-next-line
        console.log(err);
    });
};
