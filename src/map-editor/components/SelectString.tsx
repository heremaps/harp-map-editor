/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";

interface Props<T extends string> {
    values: T[];
    active?: T;
    onSelect: (val: T) => void;
}

export default class SelectString<T extends string> extends React.Component<Props<T>> {
    render() {
        const { values, active } = this.props;

        return (
            <ul className="select-list">
                {values.map((val, i) => {
                    return (
                        <li key={i}>
                            <a
                                href="#"
                                onClick={() => this.props.onSelect(val)}
                                className={val === active ? "active" : ""}
                            >
                                {val}
                            </a>
                        </li>
                    );
                })}
            </ul>
        );
    }
}
