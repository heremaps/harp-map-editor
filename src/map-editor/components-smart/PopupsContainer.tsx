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
export default class PopupsContainer extends Component<any, SettingsState> {
    static alertPopup(name: string, message: string) {
        const popups = settings.getStoreData("popups")!.slice();
        popups.push({
            name,
            component: <span>{message}</span>,
            options: {}
        });
        settings.setStoreData("popups", popups);
    }

    static addPopup(popup: Popup) {
        const popups = settings.getStoreData("popups")!.slice();
        popups.push(popup);
        settings.setStoreData("popups", popups);
    }

    static removePopup(popup: Popup) {
        settings.setStoreData(
            "popups",
            settings.getStoreData("popups")!.filter((item: Popup) => item !== popup)
        );
    }

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
            const options = popup.options || {};
            if (options.exitGuard === undefined) {
                this.closePopup(popup);
                event.preventDefault();
            }
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
                    const options = popup.options || {};
                    const exitButton =
                        options.exitGuard === undefined || options.exitGuard === "closeButton";

                    return (
                        <div
                            id={popup.id}
                            key={i}
                            className={`popup ${popup.className || ""}`}
                            onClick={() => {
                                if (options.exitGuard === undefined) {
                                    this.closePopup(popup);
                                }
                            }}
                        >
                            <section
                                className={"window" + (exitButton ? " close-button" : "")}
                                onClick={event => event.stopPropagation()}
                            >
                                <header>
                                    {popup.name}
                                    {exitButton ? (
                                        <ButtonIcon
                                            icon={ICONS.close}
                                            title="Close"
                                            onClick={event => this.closePopup(popup)}
                                        />
                                    ) : null}
                                </header>
                                <div className="content">{popup.component}</div>
                            </section>
                        </div>
                    );
                })}
            </div>
        );
    }

    private closePopup(popup: Popup) {
        if (popup.options && popup.options.exitGuard === "doNotExt") {
            return;
        }
        PopupsContainer.removePopup(popup);
    }
}
