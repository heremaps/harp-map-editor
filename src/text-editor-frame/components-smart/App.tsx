/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import SplitView from "../../components/SplitView";
import textEditor from "../TextEditor";
import Notifications from "./Notifications";
import TextEditorElem from "./TextEditorElem";

interface State {
    notificationsVisible: boolean;
    notificationsSize: number;
}

export default class App extends React.Component<any, State> {
    constructor(props: any) {
        super(props);
        this.state = {
            notificationsVisible: false,
            notificationsSize: 0
        };

        textEditor.on("InitData", ({ notificationsVisible, notificationsSize }) => {
            this.setState({ notificationsVisible, notificationsSize });
        });
        textEditor.on("ToggleNotifications", ({ notificationsVisible, notificationsSize }) => {
            this.setState({ notificationsVisible, notificationsSize });
        });
    }

    render() {
        let content = null;

        if (this.state.notificationsVisible) {
            content = (
                <SplitView
                    separatorPosition={this.state.notificationsSize}
                    section_a={<TextEditorElem />}
                    section_b={<Notifications />}
                    mode="vertical"
                    onChange={size => {
                        textEditor.resize();
                        textEditor.updateMessagesSize(size);
                    }}
                />
            );
        } else {
            content = <TextEditorElem />;
        }

        return <div id="app">{content}</div>;
    }
}
