/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import TextButton from "../../components/TextButton";
import Component, { SettingsState } from "../Component";
import Tabs, { Tab } from "../components/Tabs";
import settings from "../Settings";
import TextEditor from "../TextEditor";

import * as themeBase from "@here/harp-map-theme/resources/berlin_tilezen_base.json";
import * as themeReduced from "@here/harp-map-theme/resources/berlin_tilezen_day_reduced.json";
import * as themeNight from "@here/harp-map-theme/resources/berlin_tilezen_night_reduced.json";

const DEFAULT_THEMES = [
    {
        name: "Day",
        theme: JSON.stringify(themeBase as any, undefined, 2)
    },
    {
        name: "Day - reduced",
        theme: JSON.stringify(themeReduced as any, undefined, 2)
    },
    {
        name: "Night - reduced",
        theme: JSON.stringify(themeNight as any, undefined, 2)
    }
];

interface Stae extends SettingsState {
    activeTab: Tab;
}

interface Props {
    done: () => void;
}

/**
 * Responsible for ability to  change the theme style, and ability to load default themes.
 */
export default class extends Component<Props, Stae> {
    private m_tabs: Tab[];

    constructor(props: Props) {
        super(props);
        this.m_tabs = [];

        const styles = settings.getStoreData("styles");
        if (styles === undefined) {
            throw new Error();
        }

        if (styles.length === 0) {
            this.m_tabs.push({
                name: "Switch style",
                component: null,
                disabled: true
            });
        } else {
            this.m_tabs.push({
                name: "Switch style",
                component: (
                    <div>
                        <p>Select style to apply from theme.</p>
                        <ul className="select-list">
                            {styles.map((style: string, i: number) => {
                                return (
                                    <li key={i}>
                                        <TextButton
                                            onClick={() => {
                                                settings.set("editorCurrentStyle", style);
                                                this.props.done();
                                            }}
                                        >
                                            {style}
                                        </TextButton>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )
            });
        }

        this.m_tabs.push({
            name: "Load default theme",
            component: (
                <div>
                    <p>Load default theme template</p>
                    <ul className="select-list">
                        {DEFAULT_THEMES.map((item, i) => {
                            return (
                                <li key={i}>
                                    <TextButton
                                        onClick={() => {
                                            TextEditor.setValue(item.theme);
                                            this.props.done();
                                        }}
                                    >
                                        {item.name}
                                    </TextButton>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )
        });

        this.state = {
            activeTab: this.m_tabs.filter(tab => !tab.disabled)[0],
            store: {},
            settings: {}
        };
    }

    componentWillMount() {
        this.connectStore(["styles"]);
    }

    render() {
        return (
            <Tabs
                tabs={this.m_tabs}
                active={this.state.activeTab}
                onChange={tab => this.setState({ activeTab: tab })}
                id="switch-style"
            />
        );
    }
}
