/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import { Side } from "../../types";
import Component, { SettingsState } from "../Component";
import MapHandler from "../map-handler";
import settings from "../Settings";
import TextEditor from "../TextEditor";
import MapElem from "./MapElem";
import Menu from "./Menu";

const GAP = 40;

interface DrugStartPosition {
    x: number;
    y: number;
    editorTabSize: number;
}

interface State extends SettingsState {
    mapPadding: number[];
    drugStartPosition: DrugStartPosition | null;
}

export default class Editor extends Component<any, State> {
    private m_elemEditorTab: HTMLDivElement | null = null;

    private onSeparatorDrugStart: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    private onSeparatorDrugStop: (event: MouseEvent) => void;
    private onSeparatorDrug: (event: MouseEvent) => void;
    private onResize: () => void;

    constructor(props: object) {
        super(props);

        this.onSeparatorDrugStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            this.setState({
                drugStartPosition: {
                    x: event.clientX,
                    y: event.clientY,
                    editorTabSize: settings.get("editorTabSize")
                }
            });

            event.preventDefault();
            window.addEventListener("mousemove", this.onSeparatorDrug);
        };

        this.onSeparatorDrugStop = (event: MouseEvent) => {
            if (!this.state.drugStartPosition || !this.m_elemEditorTab || !MapHandler.elem) {
                return;
            }

            window.removeEventListener("mousemove", this.onSeparatorDrug);

            this.onSeparatorDrug(event);

            this.setState({ drugStartPosition: null });
            event.preventDefault();
        };

        this.onSeparatorDrug = (event: MouseEvent) => {
            if (!this.state.drugStartPosition) {
                return;
            }

            const pos = { x: event.clientX, y: event.clientY };
            const startPos = this.state.drugStartPosition;
            let { editorTabSize } = this.state.drugStartPosition;
            const side = settings.get("editorTabSide");

            switch (side) {
                case Side.Left:
                    editorTabSize += pos.x - startPos.x;
                    break;
                case Side.Right:
                    editorTabSize -= pos.x - startPos.x;
                    break;
                case Side.Top:
                    editorTabSize += pos.y - startPos.y;
                    break;
                case Side.Bottom:
                    editorTabSize -= pos.y - startPos.y;
                    break;
            }

            this.setEditorTabSize(editorTabSize);
            event.preventDefault();
        };

        this.onResize = () => {
            const size = settings.get("editorTabSize");
            this.setEditorTabSize(size);
        };

        this.state = {
            mapPadding: [0, 0, 0, 0],
            drugStartPosition: null,
            settings: {},
            store: {}
        };

        this.connectEvents({
            // toggle visibility of the editor UI.
            "editor:toggle": () => {
                settings.set("editorTabVisible", !settings.get("editorTabVisible"));
            },
            // set the position of the text editor.
            "editor:setSide": side => {
                settings.set("editorTabSide", side);
                if (side === Side.DeTouch) {
                    TextEditor.createWindow();
                } else {
                    TextEditor.createIframe();
                }
            }
        });
    }

    componentWillMount() {
        this.connectSettings(["editorTabVisible", "editorTabSize", "editorTabSide"]);

        if (this.state.settings.editorTabSide === Side.DeTouch) {
            settings.set("editorTabSide", Side.Left);
        }
    }

    componentDidMount() {
        const editorTabSize = settings.get("editorTabSize");
        this.setEditorTabSize(Number(editorTabSize));

        window.addEventListener("mouseup", this.onSeparatorDrugStop);
        window.addEventListener("resize", this.onResize);

        this.m_elemEditorTab!.insertBefore(
            TextEditor.elemEditor,
            this.m_elemEditorTab!.children[0]
        );
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        window.removeEventListener("mouseup", this.onSeparatorDrugStop);
        window.removeEventListener("resize", this.onResize);
    }

    render() {
        const stateSettings = this.state.settings;
        const sideName = stateSettings.editorTabSide as string;

        const mouseCatcher =
            this.state.drugStartPosition === null ? null : (
                <div id="mouse-catcher" className={sideName} />
            );

        this.setEditorTabSize(stateSettings.editorTabSize as number);

        const textEditorVisible =
            stateSettings.editorTabVisible && stateSettings.editorTabSide !== Side.DeTouch;

        return (
            <div id="editor">
                {textEditorVisible ? null : <Menu />}
                <div
                    id="text-editor"
                    ref={node => {
                        this.m_elemEditorTab = node;
                    }}
                    className={sideName}
                >
                    <div
                        className="separator-drug vertical"
                        onMouseDown={this.onSeparatorDrugStart}
                    />
                    {textEditorVisible ? <Menu /> : null}
                </div>
                <MapElem />
                {mouseCatcher}
            </div>
        );
    }

    private setEditorTabSize(size: number) {
        if (this.m_elemEditorTab === null) {
            return;
        }

        const side = settings.get("editorTabSide");

        switch (side) {
            case Side.Left:
            case Side.Right:
                if (window.innerWidth - GAP < size) {
                    size = window.innerWidth - GAP;
                } else if (size < GAP) {
                    size = GAP;
                }
                break;
            case Side.Top:
            case Side.Bottom:
                if (window.innerHeight - GAP < size) {
                    size = window.innerHeight - GAP;
                } else if (size < GAP) {
                    size = GAP;
                }
                break;
        }

        this.m_elemEditorTab.style.width = null;
        this.m_elemEditorTab.style.height = null;

        settings.set("editorTabSize", size);

        if (
            !this.state.settings.editorTabVisible ||
            this.state.settings.editorTabSide === Side.DeTouch
        ) {
            size = 0;
        }

        switch (side) {
            case Side.Left:
                this.m_elemEditorTab.style.width = `${size}px`;
                break;
            case Side.Right:
                this.m_elemEditorTab.style.width = `${size}px`;
                break;
            case Side.Top:
                this.m_elemEditorTab.style.height = `${size}px`;
                break;
            case Side.Bottom:
                this.m_elemEditorTab.style.height = `${size}px`;
                break;
            case Side.DeTouch:
                this.m_elemEditorTab.style.height = `0`;
                this.m_elemEditorTab.style.width = `0`;
                break;
        }
    }
}
