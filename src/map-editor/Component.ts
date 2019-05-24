/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import settings, { AvailableData, AvailableSetting } from "./Settings";

/**
 * Settings state interface the must be implemented for extended [[React.components]].
 */
export interface SettingsState {
    settings: { [Key in keyof AvailableSetting]?: AvailableSetting[Key] };
    store: { [Key in keyof AvailableData]?: AvailableData[Key] };
}

/**
 * Extends default [[Rect.Component]] for make easy to use [[settings]] data store.
 */
export default class Component<
    P = {},
    S extends SettingsState = { settings: {}; store: {} },
    SS = any
> extends React.Component<P, S, SS> {
    private m_settingsListeners: { [s: string]: (val: any) => void } = {};
    private m_eventsListeners: { [s: string]: (val: any) => void } = {};
    private m_storeListeners: { [s: string]: (val: any) => void } = {};

    /**
     * Receives a list settings variables to monitor. If some of specified variables will change the
     * React component will update.
     */
    connectSettings<A extends keyof AvailableSetting, B extends AvailableSetting[A]>(list: A[]) {
        list.forEach(key => {
            const listener = (val: B) => {
                this.setState(state => {
                    state.settings[key] = val;
                    return state;
                });
            };
            settings.on(`setting:${key}`, listener);
            this.m_settingsListeners[key] = listener;
        });

        this.setState({ settings: settings.read(list) });
    }

    /**
     * Receives a list store variables to monitor. If some of specified variables will change the
     * React component will update.
     */
    connectStore(list: Array<keyof AvailableData>) {
        list.forEach(key => {
            const listener = (val: any) => {
                this.setState(state => {
                    state.store[key] = val;
                    return state;
                });
            };
            settings.on(`store:${key}`, listener);
            this.m_storeListeners[key] = listener;
        });

        this.setState({ store: settings.readStore(list) });
    }

    /**
     * Receives a list of events with callbacks to monitor.
     */
    connectEvents(events: { [s: string]: (val: any) => void }) {
        Object.entries(events).forEach(([key, listener]) => {
            settings.on(key, listener);
        });
        this.m_eventsListeners = events;
    }

    componentWillUnmount() {
        // When the component is unmounting it will remove all of the observers to prevent memory
        // leaks.
        this.disconnectEvents();
        this.disconnectSettings();
        this.disconnectStore();
    }

    private disconnectSettings() {
        Object.entries(this.m_settingsListeners).forEach(([key, listener]) => {
            settings.removeListener(`setting:${key}`, listener);
        });
    }

    private disconnectStore() {
        Object.entries(this.m_storeListeners).forEach(([key, listener]) => {
            settings.removeListener(`store:${key}`, listener);
        });
    }

    private disconnectEvents() {
        Object.entries(this.m_eventsListeners).forEach(([key, listener]) => {
            settings.removeListener(key, listener);
        });
    }
}
