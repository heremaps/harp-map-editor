/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import "./style.scss";
import TextEditor from "./TextEditor";

const editorElem = document.createElement("div");
editorElem.id = "app";

const textEditor = new TextEditor(editorElem);

document.body.appendChild(editorElem);

textEditor.resize();
