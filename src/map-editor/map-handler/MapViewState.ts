/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { GeoCoordinates } from "@here/harp-geoutils/lib/coordinates/GeoCoordinates";

/**
 * Represents the position and orientation of the camera. Used for recreating the camera after page
 * reload.
 */
export default class MapViewState {
    static fromString(str: string) {
        const data = JSON.parse(str);

        return new MapViewState(data.zoom, data.center, data.yaw, data.pitch);
    }

    constructor(
        public zoom = 1,
        public center = new GeoCoordinates(52.518611, 13.376111, 0),
        public yaw = 0,
        public pitch = 0
    ) {}

    toString() {
        return JSON.stringify(this);
    }
}
