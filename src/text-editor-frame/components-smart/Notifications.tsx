/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import TextButton from "../../components/TextButton";
import { Notification } from "../../types";
import textEditor from "../TextEditor";

interface State {
    notifications: Notification[];
}

export default class extends React.Component<any, State> {
    private onNotificationUpdate: (notifications: Notification[]) => void;
    constructor(props: {}) {
        super(props);
        this.state = {
            notifications: [],
        };

        this.onNotificationUpdate = (notifications) => {
            this.setState({ notifications });
        };
    }

    componentDidMount() {
        textEditor.on("updateNotifications", this.onNotificationUpdate);
    }

    componentWillUnmount() {
        textEditor.removeListener("updateNotifications", this.onNotificationUpdate);
    }

    render() {
        const notifications = this.state.notifications;

        return (
            <div id="notifications">
                <ul className="select-list">
                    {notifications.map((message, i) => {
                        return (
                            <li className={message.severity > 6 ? "error" : ""} key={i}>
                                <TextButton
                                    onClick={(event) => {
                                        textEditor.setCursor(
                                            message.startLineNumber,
                                            message.startColumn
                                        );
                                    }}
                                >
                                    {/*tslint:disable-next-line: max-line-length*/}
                                    {`${message.startLineNumber}:${message.startColumn} ${message.message}`}
                                </TextButton>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}
