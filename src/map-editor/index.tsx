/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import "../style.scss";
import App from "./components-smart/App";
import settings from "./Settings";
import textEditor from "./TextEditor";

settings
    .init()
    .then(() => textEditor.init())
    .then(() => {
        ReactDOM.render(<App />, document.getElementById("root"));
    });
