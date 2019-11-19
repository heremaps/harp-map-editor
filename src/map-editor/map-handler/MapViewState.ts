/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { GeoCoordinates } from "@here/harp-geoutils/lib/coordinates/GeoCoordinates";

const CURRENT_VERSION = 1;

/**
 * Represents the position and orientation of the camera. Used for recreating the camera after page
 * reload.
 */
export default class MapViewState {
    static fromString(str: string) {
        const data = JSON.parse(str);

        if (data.version !== CURRENT_VERSION) {
            return new MapViewState();
        }
        return new MapViewState(data.distance, data.target, data.azimuth, data.tilt);
    }

    readonly version = CURRENT_VERSION;
    constructor(
        public distance = 3000,
        public target = new GeoCoordinates(52.518611, 13.376111, 0),
        public azimuth = 0,
        public tilt = 0
    ) {}

    toString() {
        return JSON.stringify(this);
    }
}
