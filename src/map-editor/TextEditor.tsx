/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { Theme } from "@here/harp-datasource-protocol";
import { LoggerManager } from "@here/harp-utils";
import * as React from "react";
import { Side, WindowCommands } from "../types";
import PopupsContainer from "./components-smart/PopupsContainer";
import MapHighlighter from "./map-handler/MapHighliter";
import settings from "./Settings";

export const logger = LoggerManager.instance.create("TextEditor");

/**
 * This class controls the monaco editor and communicate thru messages with the Theme editor.
 */
class TextEditor {
    readonly elemEditor = document.createElement("div");

    private m_frameURL: string;
    /**
     * Contains the child window when [[Side.DeTouch]] is selected
     */
    private m_editorWindow: Window | null = null;
    /**
     * Contains the child page when [[Side.DeTouch]] is not selected
     */
    private m_editorIframe: null | HTMLIFrameElement = null;
    /**
     * The source code of current editable theme.
     */
    private m_value = "";
    /**
     * Last parsed source code of the theme. If equals [[null]] then the source code probably
     * invalid [[JSON]].
     */
    private m_parsedTheme: Theme | null = null;

    /**
     * handles commands of the child text editor
     */
    private onMessage: (data: MessageEvent) => void;

    constructor() {
        const pagePath = window.location.pathname.toLocaleLowerCase().replace("/index.html", "");
        this.m_frameURL = `${window.location.origin}/${pagePath}/textEditor.html`;

        this.elemEditor.id = "editor-container";

        this.onMessage = (data: MessageEvent) => {
            if (!data.isTrusted || data.origin !== window.location.origin) {
                return;
            }

            const msg: WindowCommands = data.data;

            switch (msg.command) {
                case "Init":
                    this.sendMsg({
                        command: "InitData",
                        value: this.m_value,
                        column: settings.get("textEditor:column"),
                        line: settings.get("textEditor:line"),
                        notificationsVisible: settings.get("notificationsVisible"),
                        notificationsSize: settings.get("notificationsSize"),
                    });
                    break;
                case "HighlightFeature":
                    MapHighlighter.highlight(msg.condition);
                    break;
                case "UpdateSourceValue":
                    this.updateSource(msg.value);
                    settings.set("textEditor:sourceCode", this.m_value);
                    settings.set("textEditor:column", msg.column);
                    settings.set("textEditor:line", msg.line);
                    break;
                case "UpdateCursorPosition":
                    settings.set("textEditor:column", msg.column);
                    settings.set("textEditor:line", msg.line);
                    break;
                case "UpdateNotificationsCount":
                    settings.setStoreData("notificationsState", {
                        count: msg.count,
                        severity: msg.severity,
                    });
                    break;
                case "UpdateNotificationsSize":
                    settings.set("notificationsSize", msg.UpdateNotificationsSize);
                    break;
                default:
                    logger.warn(`unhandled command: ${msg.command}`);
            }
        };
    }

    async init() {
        this.createIframe();
        this.updateSource(settings.get("textEditor:sourceCode"));

        window.addEventListener("message", this.onMessage);
        window.addEventListener("beforeunload", () => {
            if (this.m_editorWindow !== null) {
                this.m_editorWindow.close();
            }
        });

        settings.on("setting:notificationsVisible", (notificationsVisible) => {
            this.sendMsg({
                command: "ToggleNotifications",
                notificationsVisible,
                notificationsSize: settings.get("notificationsSize"),
            });
        });
    }

    /**
     * Ensures that the text editor in the child iframe.
     */
    createIframe() {
        if (this.m_editorWindow !== null) {
            this.m_editorWindow.close();
            this.m_editorWindow = null;
        }
        if (this.m_editorIframe !== null) {
            return;
        }

        this.m_editorIframe = document.createElement("iframe");
        this.m_editorIframe.className = "editor";
        this.m_editorIframe.src = this.m_frameURL;

        this.elemEditor.appendChild(this.m_editorIframe);
        return this.m_editorIframe;
    }

    /**
     * Ensures that the text editor in the floating window.
     */
    createWindow() {
        if (this.m_editorWindow !== null) {
            return;
        }

        if (this.m_editorIframe !== null) {
            this.elemEditor.removeChild(this.m_editorIframe);
            this.m_editorIframe = null;
        }

        this.m_editorWindow = window.open(
            this.m_frameURL,
            "Text editor",
            "width=600,height=400,toolbar=0,status=0"
        );

        this.m_editorWindow!.addEventListener("message", this.onMessage);

        this.m_editorWindow!.onbeforeunload = () => {
            settings.emit("editor:setSide", Side.Left);
        };
    }

    /**
     * Theme source code getter.
     */
    getValue() {
        return this.m_value;
    }

    undo() {
        return this.sendMsg({ command: "undo" });
    }

    redo() {
        return this.sendMsg({ command: "redo" });
    }

    /**
     * Sets the source code, updates the available styles, and sets the proper style.
     */
    setValue(str: string) {
        this.sendMsg({ command: "SetSourceValue", value: str });
        this.updateSource(str);
    }

    /**
     * Send [[WindowCommands]] to the child text editor.
     */
    sendMsg(msg: WindowCommands) {
        if (this.m_editorWindow !== null) {
            this.m_editorWindow.postMessage(msg, this.m_frameURL);
        } else if (this.m_editorIframe !== null && this.m_editorIframe.contentWindow !== null) {
            this.m_editorIframe.contentWindow.postMessage(msg, this.m_frameURL);
        }
    }

    /**
     * Generates a file and open a file save dialogue.
     */
    download() {
        saveData(this.getValue(), "theme.json");
    }

    /**
     * Opens a file and sets it as the source code of the theme.
     */
    openFile() {
        openFile()
            .then((value) => {
                this.setValue(value);
            })
            .catch(() => {
                const popup = {
                    name: "ERROR",
                    options: {},
                    component: <p>Can't open file.</p>,
                };
                PopupsContainer.addPopup(popup);
            });
    }

    /**
     * Send a [[Format]] command to the child text editor.
     */
    formatFile() {
        this.sendMsg({ command: "Format" });
    }

    /**
     * Send a [[ShowCommands]] command to the child text editor.
     */
    showCommands() {
        this.sendMsg({ command: "ShowCommands" });
    }

    getParsedTheme() {
        return this.m_parsedTheme;
    }

    setCursor(line: number, column: number) {
        this.sendMsg({
            command: "SetCursor",
            column,
            line,
        });
    }

    /**
     * Updates the available styles list, and sets the proper style.
     */
    private updateSource(source: string) {
        this.m_value = source;
        this.m_parsedTheme = null;
        let styles: string[] = [];

        try {
            this.m_parsedTheme = JSON.parse(source) as Theme;
        } catch (error) {
            settings.setStoreData("styles", styles);
            settings.setStoreData("parsedTheme", this.m_parsedTheme);
            return;
        }

        if (this.m_parsedTheme.styles !== undefined) {
            const values = Object.values(this.m_parsedTheme.styles);
            if (values.length > 0 && values.every((value) => Array.isArray(value))) {
                styles = Object.keys(this.m_parsedTheme.styles);
            }
        }

        const currentStyle = settings.get("editorCurrentStyle");

        settings.setStoreData("styles", styles);
        settings.setStoreData("parsedTheme", this.m_parsedTheme);

        if (styles.length === 0) {
            settings.set("editorCurrentStyle", null);
        } else if (currentStyle === null || !styles.includes(currentStyle)) {
            settings.set("editorCurrentStyle", styles[0]);
        }
    }
}

const saveData = (() => {
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style.display = "none";
    return (data: string, fileName: string) => {
        const blob = new Blob([data], { type: "octet/stream" });
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    };
})();

async function openFile(): Promise<string> {
    const fileBrowser = document.createElement("input");
    document.body.appendChild(fileBrowser);
    fileBrowser.style.display = "none";
    fileBrowser.type = "file";

    fileBrowser.click();

    function removeObj() {
        document.body.removeChild(fileBrowser);
    }

    return new Promise((resolve, reject) => {
        fileBrowser.addEventListener(
            "change",
            (event) => {
                if (!event || !event.target) {
                    return reject("");
                }

                const { files } = event.target as HTMLInputElement;

                if (!files || !files[0]) {
                    return reject("");
                }

                const reader = new FileReader();
                reader.onload = () => {
                    resolve((reader.result || "").toString());
                };
                reader.onerror = () => {
                    reject("");
                };
                reader.readAsText(files[0]);
            },
            false
        );
    }).then((str) => {
        removeObj();
        return str as string;
    });
}

export default new TextEditor();
