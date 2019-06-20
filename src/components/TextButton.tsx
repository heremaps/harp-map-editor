/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";

interface Props {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

export default class extends React.Component<Props> {
    render() {
        const className = "text-button" + (this.props.className || "");
        return (
            <span className={className} onClick={this.props.onClick}>
                {this.props.children}
            </span>
        );
    }
}
