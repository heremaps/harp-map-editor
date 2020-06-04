/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import textEditor from "../TextEditor";

export default class App extends React.Component {
    private m_container: HTMLDivElement | null = null;

    componentDidMount() {
        if (this.m_container === null) {
            throw new Error();
        }

        if (!textEditor.htmlElement) {
            textEditor.init();
        }

        if (textEditor.htmlElement === null) {
            throw new Error();
        }

        this.m_container.appendChild(textEditor.htmlElement);

        requestAnimationFrame(() => {
            textEditor.resize();
        });
    }

    render() {
        return <div id="text-editor-container" ref={(node) => (this.m_container = node)} />;
    }
}
