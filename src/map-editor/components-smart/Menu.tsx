/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import { Popup, Side, TechniqueData } from "../../types";
import Component, { SettingsState } from "../Component";
import ButtonIcon, { ButtonIconProps, ICONS } from "../components/ButtonIcon";
import settings from "../Settings";
import TextEditor from "../TextEditor";
import PopupCreateTechnique from "./PopupCreateTechnique";
import PopupGeometriesList from "./PopupGeometriesList";
import PopupsContainer from "./PopupsContainer";
import PopupSelectLink from "./PopupSelectLink";
import PopupSelectTheme from "./PopupSelectTheme";

enum MenuState {
    Idle,
    SelectSide,
    Hidden,
}

interface Props extends SettingsState {
    menuState: MenuState;
}

export type NotificationType = "secondary" | "warn" | "error";

/**
 * Shows currently available actions for the user.
 */
export default class Menu extends Component<{}, Props> {
    static openNewTechniquePopup(techniqueData?: TechniqueData) {
        const popup: Popup = {
            name: "Create technique",
            options: { exitGuard: "closeButton" },
            component: (
                <PopupCreateTechnique
                    done={() => PopupsContainer.removePopup(popup)}
                    techniqueData={techniqueData}
                />
            ),
        };
        PopupsContainer.addPopup(popup);
    }

    constructor(props: {}) {
        super(props);

        this.state = {
            menuState: MenuState.Idle,
            settings: {},
            store: {},
        };
    }

    componentWillMount() {
        this.connectSettings([
            "editorTabSize",
            "editorTabVisible",
            "editorTabSide",
            "editorInfoPick",
            "notificationsVisible",
        ]);
        this.connectStore(["styles", "parsedTheme", "notificationsState"]);
    }

    render() {
        const editorTabSide = this.state.settings.editorTabSide as Side;
        const editorTabVisible = this.state.settings.editorTabVisible as boolean;
        let menuState = this.state.menuState;

        const themeIsValid = this.state.store.parsedTheme !== null;

        let buttons: ButtonIconProps[] = [
            {
                icon: ICONS.eye,
                active: editorTabVisible,
                title: "Show / Hide",
                onClick: () => {
                    settings.emit("editor:toggle");
                },
            },
        ];

        if (!editorTabVisible) {
            menuState = MenuState.Hidden;
        }

        switch (menuState) {
            case MenuState.Idle:
                buttons.unshift(
                    this.createGeometriesPopupButton(!themeIsValid),
                    this.createThemePopupButton(),
                    {
                        icon: ICONS.download,
                        title: "Download file",
                        disabled: !themeIsValid,
                        onClick: () => {
                            TextEditor.download();
                        },
                    },
                    {
                        icon: ICONS.open,
                        title: "Open file",
                        onClick: () => {
                            TextEditor.openFile();
                        },
                    },
                    {
                        icon: ICONS.format,
                        title: "Format file",
                        disabled: !themeIsValid,
                        onClick: () => {
                            TextEditor.formatFile();
                        },
                    },
                    {
                        icon: ICONS[editorTabSide],
                        title: "Change text editor position",
                        className: editorTabSide,
                        onClick: () => {
                            this.setState({ menuState: MenuState.SelectSide });
                        },
                    },
                    {
                        icon: ICONS.commands,
                        title: "Show quick command palette",
                        onClick: () => {
                            TextEditor.showCommands();
                        },
                    },
                    {
                        icon: ICONS.undo,
                        title: "Undo",
                        onClick: () => {
                            TextEditor.undo();
                        },
                    },
                    {
                        icon: ICONS.redo,
                        title: "Redo",
                        onClick: () => {
                            TextEditor.redo();
                        },
                    },
                    {
                        icon: ICONS.link,
                        title: "Get link",
                        onClick: () => {
                            settings.getSettingsURL().then((link) => {
                                PopupsContainer.addPopup({
                                    id: "share-link-popup",
                                    name: "Link",
                                    component: <PopupSelectLink link={link} />,
                                });
                            });
                        },
                    },
                    {
                        icon: ICONS.magicStick,
                        title: "Construct new style technique",
                        disabled: !themeIsValid,
                        onClick: () => Menu.openNewTechniquePopup(),
                    },
                    {
                        icon: ICONS.picker,
                        title: "Toggle info pick",
                        active: settings.get("editorInfoPick"),
                        onClick: () => {
                            settings.set("editorInfoPick", !settings.get("editorInfoPick"));
                        },
                    },
                    this.createNotificationsButton()
                );
                break;

            case MenuState.SelectSide:
                buttons = [Side.Top, Side.Right, Side.Bottom, Side.Left, Side.DeTouch].map(
                    (side, i) => {
                        return {
                            key: i,
                            icon: ICONS[side],
                            active: side === editorTabSide,
                            title: side[0].toUpperCase() + side.slice(1),
                            className: side,
                            onClick: () => {
                                settings.emit("editor:setSide", side);
                                this.setState({ menuState: MenuState.Idle });
                            },
                        };
                    }
                );
                break;
        }

        return (
            <div id="menu" className={this.state.settings.editorTabVisible ? "" : "hidden"}>
                {buttons.map((item, i) => {
                    return (
                        <ButtonIcon
                            key={i}
                            icon={item.icon}
                            title={item.title}
                            className={item.className}
                            disabled={item.disabled}
                            active={item.active}
                            onClick={item.onClick}
                            label={item.label}
                        />
                    );
                })}
            </div>
        );
    }

    private createThemePopupButton(): ButtonIconProps {
        return {
            icon: ICONS.colorPalette,
            title: "Switch styles / Load default theme",
            onClick: () => {
                const popup = {
                    name: "Switch styles",
                    options: {},
                    component: <PopupSelectTheme done={() => PopupsContainer.removePopup(popup)} />,
                };
                PopupsContainer.addPopup(popup);
            },
        };
    }

    private createGeometriesPopupButton(disabled: boolean): ButtonIconProps {
        return {
            icon: ICONS.geometries,
            title: "Geometries list",
            disabled,
            onClick: () => {
                const popup = {
                    name: "Geometries list",
                    options: {},
                    component: (
                        <PopupGeometriesList done={() => PopupsContainer.removePopup(popup)} />
                    ),
                };
                PopupsContainer.addPopup(popup);
            },
        };
    }

    private createNotificationsButton(): ButtonIconProps {
        const notificationsState = settings.getStoreData("notificationsState");
        const notificationsVisible = settings.get("notificationsVisible");

        if (notificationsState === undefined) {
            throw new Error();
        }

        let state: NotificationType = "secondary";

        if (notificationsState.severity > 6) {
            state = "error";
        } else if (notificationsState.count > 0) {
            state = "warn";
        }

        return {
            icon: ICONS.alert,
            title: "Notifications",
            className: state,
            label: notificationsState.count + "",
            active: notificationsVisible,
            onClick: () => {
                settings.set("notificationsVisible", !notificationsVisible);
            },
        };
    }
}
