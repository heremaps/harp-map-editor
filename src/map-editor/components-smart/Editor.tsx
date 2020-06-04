/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import SplitView from "../../components/SplitView";
import { Side } from "../../types";
import Component, { SettingsState } from "../Component";
import mapHandler from "../map-handler";
import settings from "../Settings";
import TextEditor from "../TextEditor";
import MapElem from "./MapElem";

export default class Editor extends Component<any, SettingsState> {
    private m_elemEditorTab: HTMLDivElement | null = null;

    constructor(props: object) {
        super(props);

        this.state = {
            settings: {},
            store: {},
        };

        this.connectEvents({
            // toggle visibility of the editor UI.
            "editor:toggle": () => {
                settings.set("editorTabVisible", !settings.get("editorTabVisible"));
            },
            // set the position of the text editor.
            "editor:setSide": (side) => {
                settings.set("editorTabSide", side);
                if (side === Side.DeTouch) {
                    TextEditor.createWindow();
                } else {
                    TextEditor.createIframe();
                }
            },
        });
    }

    componentWillMount() {
        this.connectSettings(["editorTabVisible", "editorTabSize", "editorTabSide"]);

        if (this.state.settings.editorTabSide === Side.DeTouch) {
            settings.set("editorTabSide", Side.Left);
        }
    }

    componentDidMount() {
        this.appendEditor();
    }

    componentDidUpdate() {
        this.appendEditor();
    }

    render() {
        const { editorTabSide, editorTabSize, editorTabVisible } = this.state.settings;
        const textEditorVisible = editorTabVisible && editorTabSide !== Side.DeTouch;

        let content = <MapElem auto_resize={true} />;

        if (textEditorVisible) {
            let tmpComponent;
            let layout: "vertical" | "horizontal" = "horizontal";
            let section_a = (
                <div
                    id="text-editor"
                    className={`${editorTabSide}`}
                    ref={(node) => (this.m_elemEditorTab = node)}
                />
            );

            let section_b = <MapElem auto_resize={false} />;

            switch (editorTabSide) {
                case Side.Right:
                    tmpComponent = section_a;
                    section_a = section_b;
                    section_b = tmpComponent;
                    break;
                case Side.Top:
                    layout = "vertical";
                    break;
                case Side.Bottom:
                    layout = "vertical";
                    tmpComponent = section_a;
                    section_a = section_b;
                    section_b = tmpComponent;
                    break;
            }

            content = (
                <SplitView
                    section_a={section_a}
                    section_b={section_b}
                    mode={layout}
                    separatorPosition={editorTabSize as number}
                    onResizing={() => mapHandler.resize()}
                />
            );
        }

        return <div id="editor">{content}</div>;
    }

    private appendEditor() {
        if (this.m_elemEditorTab === null) {
            return;
        }
        this.m_elemEditorTab!.insertBefore(
            TextEditor.elemEditor,
            this.m_elemEditorTab!.children[0]
        );
    }
}
