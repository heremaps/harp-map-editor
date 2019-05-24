/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import { Popup } from "../../types";
import Component, { SettingsState } from "../Component";
import ButtonIcon, { ICONS } from "../components/ButtonIcon";
import settings from "../Settings";

/**
 * Responsible for showing popups on top of the other elements.
 */
export default class extends Component<any, SettingsState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            settings: {},
            store: {}
        };

        window.addEventListener("keyup", event => {
            const popups = this.state.store.popups as Popup[];
            if (event.key !== "Escape" || popups.length === 0) {
                return;
            }

            const popup = popups[popups.length - 1];
            this.removePopup(popup);
            event.preventDefault();
        });
    }

    componentDidMount() {
        this.connectStore(["popups"]);
    }

    render() {
        const popups = (this.state.store.popups as Popup[]) || [];

        return (
            <div id="popups">
                {popups.map((popup, i) => {
                    return (
                        <div key={i} className="popup" onClick={() => this.removePopup(popup)}>
                            <section
                                className={
                                    "window" + (popup.options.doNotExit ? "" : " close-button")
                                }
                                onClick={event => event.stopPropagation()}
                            >
                                <header>{popup.name}</header>
                                {popup.options.doNotExit ? null : (
                                    <ButtonIcon
                                        icon={ICONS.close}
                                        title="Close"
                                        onClick={event => this.removePopup(popup)}
                                    />
                                )}
                                <div className="content">{popup.component}</div>
                            </section>
                        </div>
                    );
                })}
            </div>
        );
    }

    private removePopup(popup: Popup) {
        if (popup.options.doNotExit) {
            return;
        }
        const popups = (this.state.store.popups as Popup[]).filter(item => item !== popup);
        settings.setStoreData("popups", popups);
    }
}
