/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as monaco from "monaco-editor";
import { throttle } from "throttle-debounce";
import { WindowCommands } from "../types";
import * as schema from "./harp-theme.vscode.schema.json";

/**
 * This class controls the monaco editor and communicate thru messages with the Theme editor.
 */
export default class TextEditor {
    /**
     * The macro editor instance
     */
    private m_editor: monaco.editor.IStandaloneCodeEditor;

    constructor(readonly elemEditor: HTMLElement) {
        const modelUri = monaco.Uri.parse("a:/harp.gl/default.theme.json");
        const model = monaco.editor.createModel("", "json", modelUri);

        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
                {
                    uri: "https://github.com/heremaps/harp.gl/theme.scheme.json",
                    fileMatch: [".theme.json"],
                    schema
                }
            ]
        });

        this.m_editor = monaco.editor.create(this.elemEditor, {
            language: "json",
            model
        });

        window.addEventListener("resize", () => this.resize());
        window.addEventListener("message", data => {
            if (
                !data.isTrusted ||
                data.origin !== window.location.origin ||
                data.target === data.source
            ) {
                return;
            }
            this.onMessage(data.data);
        });

        // Inform the Theme editor that the text editor is ready. The Theme editor then will send a
        // "InitData" or "SetSourceValue" command.
        this.sendMsg({ command: "Init" });

        // When the theme source code is changing sends the changes to the Theme editor
        this.m_editor.onDidChangeModelContent(
            // Prevents too frequent code source updating
            throttle(1000, (event: monaco.editor.IModelContentChangedEvent) => {
                const code = this.m_editor!.getValue();
                const change = event.changes[event.changes.length - 1];

                // Prevent sending incorrect json data
                try {
                    JSON.parse(code);
                    this.sendMsg({
                        command: "UpdateSourceValue",
                        line: change.range.startLineNumber,
                        column: change.range.startColumn,
                        value: code
                    });
                } catch (error) {
                    /* */
                }
            })
        );

        this.m_editor.focus();
    }

    resize() {
        if (this.m_editor === null) {
            return;
        }
        this.m_editor.layout();
    }

    /**
     * Handle incoming messages from the parent window/page (editor).
     */
    private onMessage(msg: WindowCommands) {
        switch (msg.command) {
            case "InitData":
                const position = { lineNumber: msg.line, column: msg.column };
                this.m_editor!.setValue(msg.value);
                this.m_editor!.setPosition(position);
                this.m_editor!.revealPositionInCenter(position);
                break;
            case "SetSourceValue":
                this.m_editor!.setValue(msg.value);
                break;
            case "GetSourceValue":
                this.sendMsg({ command: "SetSourceValue", value: this.m_editor!.getValue() });
                break;
            case "Format":
                this.m_editor!.getAction("editor.action.formatDocument").run();
                break;
            case "ShowCommands":
                this.m_editor!.getAction("editor.action.quickCommand").run();
                break;
            case "undo":
                this.m_editor!.trigger("aaaa", "undo", "aaaa");
                break;
            case "redo":
                this.m_editor!.trigger("aaaa", "redo", "aaaa");
                break;
        }
    }

    /**
     * Send the message to the parent window/page (editor)
     */
    private sendMsg(msg: WindowCommands) {
        window.parent.postMessage(msg, window.location.origin);
    }
}
