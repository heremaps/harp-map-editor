/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { Style } from "@here/harp-datasource-protocol";
import { Expr } from "@here/harp-datasource-protocol/lib/Expr";
import { EventEmitter } from "events";
import * as monaco from "monaco-editor";
import { throttle } from "throttle-debounce";
import { Notification, WindowCommands } from "../types";
import * as schema from "./harp-theme.vscode.schema.json";

type Commands = WindowCommands["command"];

/**
 * This class controls the monaco editor and communicate thru messages with the Theme editor.
 */
export class TextEditor extends EventEmitter {
    /**
     * The macro editor instance
     */
    private m_editor: monaco.editor.IStandaloneCodeEditor | null = null;
    private m_monacoNotifications: Notification[] = [];
    private m_editorElem: HTMLElement | null = null;

    private m_modelUri = monaco.Uri.parse("a:/harp.gl/default.theme.json");
    private m_model = monaco.editor.createModel("", "json", this.m_modelUri);

    init() {
        this.m_editorElem = document.createElement("div");

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

        this.m_editor = monaco.editor.create(this.m_editorElem, {
            language: "json",
            model: this.m_model
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

                this.lintWhenProperties(code);

                this.sendMsg({
                    command: "UpdateSourceValue",
                    line: change.range.startLineNumber,
                    column: change.range.startColumn,
                    value: code
                });
            })
        );

        // When cursor position is changing sends the changes to the Theme editor
        this.m_editor.onDidChangeCursorPosition(
            // Prevents too frequent code source updating
            throttle(1000, (event: monaco.editor.ICursorPositionChangedEvent) => {
                this.sendMsg({
                    command: "UpdateCursorPosition",
                    line: event.position.lineNumber,
                    column: event.position.column
                });
            })
        );

        // sent notifications and error messages about current theme file
        setInterval(() => {
            this.m_monacoNotifications = monaco.editor
                .getModelMarkers({ take: 500 })
                .sort((a, b) => b.severity - a.severity);
            this.emit("updateNotifications", this.m_monacoNotifications);

            if (this.m_monacoNotifications.length === 0) {
                this.sendMsg({
                    command: "UpdateNotificationsCount",
                    count: 0,
                    severity: 0
                });
            } else {
                this.sendMsg({
                    command: "UpdateNotificationsCount",
                    count: this.m_monacoNotifications.length,
                    severity: this.m_monacoNotifications[0].severity
                });
            }
        }, 500);

        this.m_editor.focus();
    }

    resize() {
        if (this.m_editor === null) {
            throw new Error();
        }
        this.m_editor.layout();
    }

    updateMessagesSize(UpdateNotificationsSize: number) {
        this.sendMsg({ command: "UpdateNotificationsSize", UpdateNotificationsSize });
    }

    on(event: Commands | "updateNotifications", listener: (...args: any[]) => void) {
        return super.on(event, listener);
    }

    setCursor(lineNumber: number, column: number) {
        const cursorPosition = { lineNumber, column };
        this.m_editor!.setPosition(cursorPosition);
        this.m_editor!.revealPositionInCenter(cursorPosition);
    }

    /**
     * Finding wrong "when" properties in styles of theme
     */
    private lintWhenProperties(code: string) {
        let markers: monaco.editor.IMarker[] = [];
        try {
            const data = JSON.parse(code);
            const lines = code.split("\n");

            markers = Object.values(data.styles as { [key: string]: Style[] })
                // flatten all styles
                .reduce((a, b) => [...a, ...b], [])
                // find "when" props with errors
                .map(style => {
                    if (typeof style.when === "string") {
                        try {
                            Expr.parse(style.when);
                        } catch (error) {
                            return [style.when, error.message];
                        }
                    }
                    return undefined;
                })
                .filter(query => query !== undefined)
                // create Markers from errors
                .map(query => {
                    const startLineNumber = lines.findIndex(line =>
                        line.includes((query as string[])[0])
                    );
                    const startColumn = lines[startLineNumber].indexOf((query as string[])[0]);
                    const result: monaco.editor.IMarker = {
                        startLineNumber: startLineNumber + 1,
                        endLineNumber: startLineNumber + 1,
                        startColumn: startColumn + 1,
                        endColumn: startColumn + 1 + (query as string[])[0].length,
                        severity: 8,
                        message: (query as string[])[1],
                        owner: "editor-lint",
                        resource: this.m_modelUri
                    };
                    return result;
                });
        } catch (error) {
            /* */
        }

        monaco.editor!.setModelMarkers(this.m_model, "editor-lint", markers);
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
            case "SetCursor":
                this.setCursor(msg.line, msg.column);
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
        this.emit(msg.command, msg);
    }

    /**
     * Send the message to the parent window/page (editor)
     */
    private sendMsg(msg: WindowCommands) {
        window.parent.postMessage(msg, window.location.origin);
    }

    get htmlElement() {
        return this.m_editorElem;
    }
}

export default new TextEditor();
