/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import { Popup, Side } from "../../types";
import Component, { SettingsState } from "../Component";
import ButtonIcon, { ButtonIconProps, ICONS } from "../components/ButtonIcon";
import settings from "../Settings";
import TextEditor from "../TextEditor";
import PopupSelectTheme from "./PopupSelectTheme";

enum MenuState {
    Idle,
    SelectSide,
    Hidden
}

interface Props extends SettingsState {
    menuState: MenuState;
}

/**
 * Shows currently available actions for the user.
 */
export default class extends Component<{}, Props> {
    constructor(props: {}) {
        super(props);

        this.state = {
            menuState: MenuState.Idle,
            settings: {},
            store: {}
        };
    }

    componentWillMount() {
        this.connectSettings([
            "editorTabSize",
            "editorTabVisible",
            "editorTabSide",
            "editorInfoPick"
        ]);
        this.connectStore(["styles"]);
    }

    render() {
        const editorTabSide = this.state.settings.editorTabSide as Side;
        const editorTabVisible = this.state.settings.editorTabVisible as boolean;
        let menuState = this.state.menuState;

        let buttons: ButtonIconProps[] = [
            {
                icon: ICONS.eye,
                active: editorTabVisible,
                title: "Show / Hide",
                onClick: () => {
                    settings.emit("editor:toggle");
                }
            }
        ];

        if (!editorTabVisible) {
            menuState = MenuState.Hidden;
        }

        switch (menuState) {
            case MenuState.Idle:
                buttons.unshift(
                    {
                        icon: ICONS.download,
                        title: "Download file",
                        onClick: () => {
                            TextEditor.download();
                        }
                    },
                    {
                        icon: ICONS.open,
                        title: "Open file",
                        onClick: () => {
                            TextEditor.openFile();
                        }
                    },
                    {
                        icon: ICONS.format,
                        title: "Format file",
                        onClick: () => {
                            TextEditor.formatFile();
                        }
                    },
                    {
                        icon: ICONS[editorTabSide],
                        title: "Change text editor position",
                        className: editorTabSide,
                        onClick: () => {
                            this.setState({ menuState: MenuState.SelectSide });
                        }
                    },
                    {
                        icon: ICONS.picker,
                        title: "Toggle info pick",
                        active: settings.get("editorInfoPick"),
                        onClick: () => {
                            settings.set("editorInfoPick", !settings.get("editorInfoPick"));
                        }
                    },
                    {
                        icon: ICONS.commands,
                        title: "Show quick command palette",
                        onClick: () => {
                            TextEditor.showCommands();
                        }
                    },
                    {
                        icon: ICONS.undo,
                        title: "Undo",
                        onClick: () => {
                            TextEditor.undo();
                        }
                    },
                    {
                        icon: ICONS.redo,
                        title: "Redo",
                        onClick: () => {
                            TextEditor.redo();
                        }
                    }
                );

                if (this.state.store.styles !== null) {
                    buttons.unshift(this.createThemePopup());
                }
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
                            }
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
                            active={item.active}
                            onClick={item.onClick}
                        />
                    );
                })}
            </div>
        );
    }

    private createThemePopup(): ButtonIconProps {
        return {
            icon: ICONS.colorPalette,
            title: "Switch styles / Load default theme",
            onClick: () => {
                const popups = settings.getStoreData("popups")!.slice();
                const popup = {
                    name: "Switch styles",
                    options: {},
                    component: (
                        <PopupSelectTheme
                            done={() => {
                                settings.setStoreData(
                                    "popups",
                                    settings
                                        .getStoreData("popups")!
                                        .filter((item: Popup) => item !== popup)
                                );
                            }}
                        />
                    )
                };
                popups.push(popup);
                settings.setStoreData("popups", popups);
            }
        };
    }
}
