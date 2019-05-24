/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import Component, { SettingsState } from "../Component";
import Editor from "./Editor";
import PopupsContainer from "./PopupsContainer";

export default class App extends Component<any, SettingsState> {
    render() {
        return (
            <div id="app">
                <Editor />
                <PopupsContainer />
            </div>
        );
    }
}
