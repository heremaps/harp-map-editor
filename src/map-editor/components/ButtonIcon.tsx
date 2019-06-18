/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import {
    FiAlertTriangle,
    FiBox,
    FiCheck,
    FiCheckSquare,
    FiCopy,
    FiSidebar,
    FiSquare,
    FiTerminal,
    FiX
} from "react-icons/fi";
import {
    IoIosColorPalette,
    IoIosColorWand,
    IoIosFolderOpen,
    IoIosRedo,
    IoIosUndo,
    IoMdCode,
    IoMdColorFilter,
    IoMdDownload,
    IoMdEye
} from "react-icons/io";
import { Side } from "../../types";

export class ICONS {
    static readonly eye = IoMdEye;
    static readonly [Side.Bottom] = FiSidebar;
    static readonly [Side.Left] = FiSidebar;
    static readonly [Side.Right] = FiSidebar;
    static readonly [Side.Top] = FiSidebar;
    static readonly [Side.DeTouch] = FiCopy;
    static readonly download = IoMdDownload;
    static readonly open = IoIosFolderOpen;
    static readonly format = IoMdCode;
    static readonly picker = IoMdColorFilter;
    static readonly commands = FiTerminal;
    static readonly check = FiCheck;
    static readonly checkOn = FiCheckSquare;
    static readonly checkOff = FiSquare;
    static readonly colorPalette = IoIosColorPalette;
    static readonly close = FiX;
    static readonly undo = IoIosUndo;
    static readonly redo = IoIosRedo;
    static readonly geometries = FiBox;
    static readonly magicStick = IoIosColorWand;
    static readonly alert = FiAlertTriangle;
}

export type EventCallBack = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

export interface ButtonIconProps {
    icon: React.ComponentFactory<any, any>;
    active?: boolean;
    onClick?: EventCallBack;
    disabled?: boolean;
    label?: string;
    title?: string;
    className?: string;
}

export default class ButtonIcon extends React.Component<ButtonIconProps> {
    render() {
        const { onClick, title, disabled, active, label } = this.props;
        const Icon = this.props.icon;
        let className = "button-icon no-select";

        if (!Icon) {
            throw new Error();
        }

        if (active) {
            className += " active";
        } else if (disabled) {
            className += " disabled";
        }

        if (this.props.className) {
            className += ` ${this.props.className}`;
        }

        return (
            <div className={className} onClick={disabled ? undefined : onClick} title={title}>
                <Icon />
                {label !== undefined ? <span>{label}</span> : null}
            </div>
        );
    }
}
