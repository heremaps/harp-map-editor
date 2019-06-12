/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { Theme } from "@here/harp-datasource-protocol";
import * as theme from "@here/harp-map-theme/resources/berlin_tilezen_base.json";
import { EventEmitter } from "events";
import { throttle } from "throttle-debounce";
import { Popup, Side } from "../types";
import MapViewState from "./map-handler/MapViewState";

/**
 * Describe settings interface and settings types.
 */
export interface AvailableSetting {
    /**
     * The side in the browser where to be to the text editor.
     */
    editorTabSide: Side;
    /**
     * The size of the text editor. With or height depending on [[AvailableSetting.editorTabSide]].
     */
    editorTabSize: number;
    /**
     * Hidden or not the text editor.
     */
    editorTabVisible: boolean;
    /**
     * Toggle ability to pik info about elements on map.
     */
    editorInfoPick: boolean;
    /**
     * Current style from theme that currently uses the data source.
     */
    editorCurrentStyle: string | null;
    /**
     * Current column of the text editor cursor.
     */
    "textEditor:column": number;
    /**
     * Current line of the text editor cursor.
     */
    "textEditor:line": number;
    /**
     * Source code of the JSON Theme.
     */
    "textEditor:sourceCode": string;
    /**
     * Saves the position what we currently observing.
     */
    editorMapViewState: string;
    /**
     * Access Key for HERE data sources.
     */
    accessKeyId: string;
    /**
     * Secret access Key for HERE data sources.
     */
    accessKeySecret: string;
}

/**
 * Describe store interface and store types.
 */
export interface AvailableData {
    /**
     * Access Key for HERE data sources.
     */
    accessKeyId: string;
    /**
     * Secret access Key for HERE data sources.
     */
    accessKeySecret: string;
    /**
     * True if the current session is authorized and we get the bearer token.
     */
    authorized: boolean;
    /**
     * Contains current visible popups.
     */
    popups: Popup[];
    /**
     * Contains current available styles from the map theme.
     */
    styles: string[];
    /**
     * Last parsed source code of the theme. If equals [[null]] then the source code probably
     * invalid [[JSON]].
     */
    parsedTheme: Theme | null;
}

type Setting = string | number | boolean | Side | null;

/**
 * Manages settings and store data, allow to observe changes thru events.
 */
class Settings<SType extends object, StType> extends EventEmitter {
    //Key where to save user settings in localStore.
    readonly m_settingsName = "editorSettings";

    /**
     * Save user settings to localStore immediately.
     */
    saveForce: () => void;

    /**
     * User settings stores here.
     */
    private m_settings: SType;
    /**
     * The data store.
     */
    private m_store: { [Key in keyof StType]?: StType[Key] };

    /**
     * Saves the settings data to localStore asynchronously
     */
    private save: () => void;

    constructor(
        settingsDefaults: SType,
        initialStoreData: { [Key in keyof StType]?: StType[Key] }
    ) {
        super();

        this.m_settings = settingsDefaults;
        this.m_store = initialStoreData;

        this.load();

        Object.entries(this.m_settings).forEach(([key, val]) => this.emit(key, val));

        this.saveForce = () => {
            if (!localStorage) {
                return;
            }

            localStorage.setItem(this.m_settingsName, JSON.stringify(this.m_settings));
        };

        this.save = throttle(500, this.saveForce);

        window.onbeforeunload = () => {
            this.saveForce();
        };
    }

    /**
     * Sets specified setting ans saves it to localStore asynchronously.
     */
    set<A extends keyof SType, B extends SType[A] & Setting>(key: A, val: B) {
        if (this.m_settings[key] === val) {
            return val;
        }

        this.m_settings[key] = val;
        this.save();
        this.emit(`setting:${key}`, val);
        return val;
    }

    /**
     * Returns value of specified setting.
     */
    get<A extends keyof SType, B extends SType[A]>(key: A): B {
        if (this.m_settings.hasOwnProperty(key)) {
            return this.m_settings[key] as B;
        }
        throw new Error(`Setting "${key}" don't exist`);
    }

    /**
     * Sets specified data to the store by specified key.
     */
    setStoreData<A extends keyof StType, B extends StType[A]>(key: A, val: B) {
        if (this.m_store[key] === val) {
            return val;
        }

        this.m_store[key] = val;
        this.save();
        this.emit(`store:${key}`, val);
        return val;
    }

    /**
     * Returns store data of specified key.
     */
    getStoreData<A extends keyof StType, B extends StType[A]>(key: A): B | undefined {
        if (this.m_store.hasOwnProperty(key)) {
            return this.m_store[key] as B;
        }
        return undefined;
    }

    /**
     * Get multiple settings at once.
     */
    read<A extends keyof SType, B extends SType[A] & Setting>(list: A[]): { [key in A]?: B } {
        const res: { [key in A]?: B } = {};
        for (const key of list) {
            if (this.m_settings.hasOwnProperty(key)) {
                res[key] = this.m_settings[key] as B;
            }
        }
        return res;
    }

    /**
     * Get multiple entries from store at once.
     */
    readStore<A extends keyof StType, B extends StType[A]>(
        list: A[]
    ): { [key in keyof StType]?: StType[key] } {
        const res: { [key in keyof StType]?: StType[key] } = {};
        for (const key of list) {
            if (this.m_store.hasOwnProperty(key)) {
                res[key] = this.m_store[key] as B;
            }
        }
        return res;
    }

    /**
     * Load and parse data from localStore
     */
    private load() {
        if (!localStorage) {
            return;
        }

        const data = localStorage.getItem(this.m_settingsName);
        if (data === null) {
            return;
        }

        const userSettings = JSON.parse(data);
        const keys = Object.keys(this.m_settings) as Array<keyof SType>;

        keys.forEach(key => {
            if (userSettings.hasOwnProperty(key)) {
                this.m_settings[key] = userSettings[key];
            }
        });
    }
}

// Create settings manager with defaults
const settings = new Settings<AvailableSetting, AvailableData>(
    {
        editorTabSide: Side.Left,
        editorTabSize: 600,
        editorTabVisible: true,
        editorInfoPick: false,
        editorCurrentStyle: null,
        editorMapViewState: new MapViewState().toString(),
        accessKeyId: "",
        accessKeySecret: "",
        "textEditor:column": 1,
        "textEditor:line": 1,
        "textEditor:sourceCode": JSON.stringify(theme as any, undefined, 4)
    },
    { popups: [], styles: [] }
);

// Singleton settings manager
export default settings;
