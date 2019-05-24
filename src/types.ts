/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Base command type for browser messaging
 */
interface Command {
    command: string;
}

export interface SetSourceValue extends Command {
    command: "SetSourceValue";
    value: string;
}

export interface GetSourceValue extends Command {
    command: "GetSourceValue";
}

export interface UpdateSourceValue extends Command {
    command: "UpdateSourceValue";
    line: number;
    column: number;
    value: string;
}

export interface Format extends Command {
    command: "Format";
}
export interface ShowCommands extends Command {
    command: "ShowCommands";
}

export interface Init extends Command {
    command: "Init";
}

export interface InitData extends Command {
    command: "InitData";
    line: number;
    column: number;
    value: string;
}

export interface Undo extends Command {
    command: "undo";
}

export interface Redo extends Command {
    command: "redo";
}

/**
 * Type that collect all available messages. This messages used for connect the text editor with the
 * map style editor
 */
export type WindowCommands =
    | SetSourceValue
    | GetSourceValue
    | Format
    | Init
    | UpdateSourceValue
    | InitData
    | ShowCommands
    | Undo
    | Redo;

/**
 * Contains all available positions for the text editor window
 */
export enum Side {
    Left = "left",
    Right = "right",
    Top = "top",
    Bottom = "bottom",
    DeTouch = "float"
}

/**
 * Popup window interface
 */
export interface Popup {
    component: JSX.Element;
    name: string;
    options: {
        doNotExit?: boolean;
    };
}
