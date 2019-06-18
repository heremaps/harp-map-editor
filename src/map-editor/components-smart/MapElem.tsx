/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { MapControlsUI } from "@here/harp-map-controls";
import * as React from "react";
import Component, { SettingsState } from "../Component";
import MapHandler from "../map-handler";
import Info from "./Info";
import Menu from "./Menu";

interface Props {
    auto_resize: boolean;
}

/**
 * Responsible for managing DOM element of the map.
 */
export default class extends Component<Props, SettingsState> {
    private m_elemCopyright: HTMLDivElement | null = null;
    private m_controlsContainer: HTMLDivElement | null = null;
    private m_mapControlsUI: MapControlsUI | null = null;

    private onMapRemoved: () => void;
    private onMapCreated: () => void;
    private onResize: () => void;

    constructor(props: Props) {
        super(props);

        this.state = {
            settings: {},
            store: {}
        };

        this.onResize = () => {
            if (this.props.auto_resize === true) {
                MapHandler.resize();
            }
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

                const copyrightElem = elem.querySelector("#copyright") as HTMLDivElement;
                copyrightElem.remove();
                elem.appendChild(MapHandler.copyrightElem as HTMLElement);
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

        MapHandler.on("mapCreated", this.onMapCreated);
        MapHandler.on("mapRemoved", this.onMapRemoved);
        window.addEventListener("resize", this.onResize);

        this.onMapCreated();
    }

    componentDidUpdate() {
        MapHandler.resize();
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        MapHandler.removeListener("mapCreated", this.onMapCreated);
        MapHandler.removeListener("mapRemoved", this.onMapRemoved);
        window.removeEventListener("resize", this.onResize);
    }

    render() {
        return (
            <div id="map-container" className={this.state.settings.editorTabSide as string}>
                <div id="controls-container" ref={node => (this.m_controlsContainer = node)} />
                <canvas className="map" />
                <div id="copyright" ref={node => (this.m_elemCopyright = node)} />
                <Info />
                <Menu />
            </div>
        );
    }
}
