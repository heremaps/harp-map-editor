/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";

export interface Tab {
    name: string;
    component: JSX.Element | null;
    disabled?: boolean;
}

interface Props {
    tabs: Tab[];
    active: Tab;
    id?: string;
    onChange: (tab: Tab) => void;
}

export default class extends React.Component<Props> {
    render() {
        if (this.props.tabs.length === 0) {
            return null;
        } else if (this.props.tabs.length === 1) {
            return this.props.tabs[0].component;
        }

        return (
            <section className="tabs" id={this.props.id}>
                <ul>
                    {this.props.tabs.map((tab, i) => {
                        let classes = tab === this.props.active ? "active" : "";
                        classes += tab.disabled === true ? " disabled" : "";

                        return (
                            <li
                                key={i}
                                onClick={() => {
                                    if (tab.disabled === true) {
                                        return;
                                    }
                                    this.props.onChange(tab);
                                }}
                                className={classes}
                            >
                                {tab.name}
                            </li>
                        );
                    })}
                </ul>
                <div className="tab-content">{this.props.active.component}</div>
            </section>
        );
    }
}
