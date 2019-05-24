/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import Component, { SettingsState } from "../Component";
import MapHandler from "../map-handler";

interface State extends SettingsState {
    intersectInfo: { [key: string]: any } | null;
}

export default class extends Component<any, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            settings: {},
            store: {},
            intersectInfo: {}
        };
    }

    componentDidMount() {
        this.connectSettings(["editorTabVisible", "editorInfoPick"]);

        MapHandler.once("init", () => {
            MapHandler.elem!.addEventListener("click", (event: MouseEvent) => {
                if (!this.state.settings.editorInfoPick) {
                    return;
                }
                const intersectInfo = MapHandler.intersect(event);
                this.setState({ intersectInfo });
                event.preventDefault();
            });
        });
    }

    componentWillUpdate() {
        if (!this.state.settings.editorInfoPick && this.state.intersectInfo) {
            this.setState({ intersectInfo: null });
        }
    }

    render() {
        let IntersectInfo = null;
        if (this.state.intersectInfo) {
            IntersectInfo = (
                <div
                    id="intersect-info"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(this.state.intersectInfo, undefined, 2)
                    }}
                />
            );
        }

        return <div id="info-block">{IntersectInfo}</div>;
    }
}
