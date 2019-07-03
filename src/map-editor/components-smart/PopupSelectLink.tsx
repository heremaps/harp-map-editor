/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import ButtonIcon, { ICONS } from "../components/ButtonIcon";

interface Props {
    link: string;
    done?: () => void;
}

function copyText(text: string) {
    function selectElementText(domElement: HTMLElement) {
        const range = document.createRange();
        range.selectNode(domElement);
        const selection = window.getSelection();
        if (selection !== null) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    const element = document.createElement("DIV");
    element.textContent = text;
    document.body.appendChild(element);
    selectElementText(element);
    document.execCommand("copy");
    element.remove();
}

export default class extends React.Component<Props> {
    render() {
        return (
            <div id="popup-copy-link">
                <input type="text" value={this.props.link} className="popup-input" readOnly />
                <ButtonIcon
                    onClick={() => {
                        copyText(this.props.link);
                    }}
                    icon={ICONS.copy}
                    title="Copt link"
                />
            </div>
        );
    }
}
