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

export interface Notification {
    message: string;
    severity: number;
    startColumn: number;
    startLineNumber: number;
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

export interface UpdateCursorPosition extends Command {
    command: "UpdateCursorPosition";
    line: number;
    column: number;
}

export interface Init extends Command {
    command: "Init";
}

export interface InitData extends Command {
    command: "InitData";
    line: number;
    column: number;
    value: string;
    notificationsVisible: boolean;
    notificationsSize: number;
}

export interface SetCursor extends Command {
    command: "SetCursor";
    line: number;
    column: number;
}

export interface Undo extends Command {
    command: "undo";
}

export interface Redo extends Command {
    command: "redo";
}

export interface ToggleNotifications extends Command {
    command: "ToggleNotifications";
    notificationsVisible: boolean;
    notificationsSize: number;
}

export interface UpdateNotificationsCount extends Command {
    command: "UpdateNotificationsCount";
    count: number;
    severity: number;
}

export interface UpdateNotificationsSize extends Command {
    command: "UpdateNotificationsSize";
    UpdateNotificationsSize: number;
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
    | Redo
    | UpdateCursorPosition
    | ToggleNotifications
    | UpdateNotificationsSize
    | UpdateNotificationsCount
    | SetCursor;

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
    className?: string;
    id?: string;
    options?: {
        exitGuard?: "doNotExt" | "closeButton";
    };
}

export type Techniques =
    | "solid-line"
    | "dashed-line"
    | "line"
    | "fill"
    | "text"
    | "labeled-icon"
    | "none";

export class TechniqueData {
    layer?: string;
    geometryType?: GeometryType;
    technique?: Techniques;
    description?: string;
    when?: string;
}

export type GeometryType = "line" | "polygon" | "point";

export interface WhenPropsData {
    $geometryType: GeometryType;
    $layer: string;
    $id?: number;
    $level?: number;
    min_zoom?: number;
    kind?: string;
    kind_detail?: string;
    network?: string;
}
