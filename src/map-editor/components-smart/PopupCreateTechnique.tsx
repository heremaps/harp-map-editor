/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import { ResolvedStyleDeclaration } from "@here/harp-datasource-protocol";
import { Expr } from "@here/harp-datasource-protocol/lib/Expr";
import * as React from "react";
import { GeometryType, TechniqueData, Techniques } from "../../types";
import Component, { SettingsState } from "../Component";
import ButtonIcon, { ICONS } from "../components/ButtonIcon";
import SelectString from "../components/SelectString";
import * as DATASOURCE_SCHEMA from "../datasourceSchemaModified.json";
import MapHandler from "../map-handler";
import PopupsContainer from "./PopupsContainer";

interface State extends SettingsState {
    techniqueData: TechniqueData;
}

interface LayerData {
    geometry_types: GeometryType[];
    properties: {
        [key: string]: {
            [key: string]: string;
        };
    };
}

const GEOMETRY_TECHNiQUES: { [key in GeometryType]: Techniques[] } = {
    line: ["none", "solid-line", "dashed-line", "line"],
    polygon: ["none", "fill", "solid-line", "dashed-line", "line"],
    point: ["none", "text", "labeled-icon"]
};

const LAYERS = Object.keys(DATASOURCE_SCHEMA);

interface Props {
    done: () => void;
    techniqueData?: TechniqueData;
}

/**
 * Responsible for ability to  change the theme style, and ability to load default themes.
 */
export default class extends Component<Props, State> {
    private m_input: HTMLInputElement | null = null;

    constructor(props: Props) {
        super(props);
        this.state = {
            settings: {},
            store: {},
            techniqueData: props.techniqueData || new TechniqueData()
        };
    }

    componentWillMount() {
        this.connectStore(["styles"]);
    }

    addStyle() {
        const { techniqueData } = this.state;
        if (techniqueData.technique === undefined) {
            throw new Error();
        }

        if (techniqueData.when === undefined) {
            PopupsContainer.alertPopup("Error", "Style is missing mandatory when condition.");
            return;
        }

        const style = {
            technique: techniqueData.technique,
            when:
                typeof techniqueData.when === "string"
                    ? Expr.parse(techniqueData.when).toJSON()
                    : techniqueData.when,
            description: techniqueData.description,
            attr: {}
        };

        switch (MapHandler.addStyleTechnique(style as ResolvedStyleDeclaration)) {
            case "err":
                PopupsContainer.alertPopup("Error", "Can't create style.");
                break;
            case "exists":
                PopupsContainer.alertPopup("Error", "Description is already exists.");
                break;
            case "ok":
                this.props.done();
                break;
        }
    }

    render() {
        let currentPage = null;
        const { techniqueData } = this.state;

        if (techniqueData.layer === undefined) {
            currentPage = (
                <div>
                    <h3>Select Layer</h3>
                    <SelectString
                        values={LAYERS}
                        active={techniqueData.layer}
                        onSelect={val => {
                            techniqueData.layer = val;
                            this.setState({ techniqueData });
                        }}
                    />
                </div>
            );
        } else if (techniqueData.geometryType === undefined) {
            // @ts-ignore: Element implicitly has an 'any' type
            const layerData = DATASOURCE_SCHEMA[techniqueData.layer as string] as LayerData;

            currentPage = (
                <div>
                    <h3>Select geometry type</h3>
                    <SelectString
                        values={layerData.geometry_types}
                        active={techniqueData.geometryType}
                        onSelect={val => {
                            techniqueData.geometryType = val;
                            this.setState({ techniqueData });
                        }}
                    />
                </div>
            );
        } else if (techniqueData.technique === undefined) {
            if (techniqueData.geometryType === undefined) {
                throw new Error();
            }
            const techniques = GEOMETRY_TECHNiQUES[techniqueData.geometryType];
            currentPage = (
                <div>
                    <h3>Select technique</h3>
                    <SelectString
                        values={techniques}
                        active={techniqueData.technique}
                        onSelect={val => {
                            techniqueData.technique = val;
                            this.setState({ techniqueData });
                        }}
                    />
                </div>
            );
        } else if (techniqueData.when === undefined) {
            if (techniqueData.geometryType === undefined) {
                throw new Error();
            }
            // @ts-ignore: Element implicitly has an 'any' type
            const currentLayerData = DATASOURCE_SCHEMA[techniqueData.layer as string] as LayerData;
            // tslint:disable-next-line: max-line-length
            const defaultValue = `$layer == '${techniqueData.layer}' && $geometryType == '${techniqueData.geometryType}'`;

            currentPage = (
                <div>
                    <h3>Set "when" selector field</h3>
                    <div className="info">
                        {Object.entries(currentLayerData.properties).map(([section, props], i) => {
                            return (
                                <section key={i}>
                                    <h4>{section}</h4>
                                    <ul className="list">
                                        {Object.entries(props).map(([key, val], j) => {
                                            return (
                                                <li key={j}>
                                                    <b>{key}: </b>
                                                    {(typeof val as string | object) === "string"
                                                        ? val
                                                        : JSON.stringify(val, undefined, 4)}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </section>
                            );
                        })}
                    </div>
                    <input
                        className="popup-input"
                        type="text"
                        ref={elem => (this.m_input = elem)}
                        defaultValue={defaultValue}
                    />
                    <ButtonIcon
                        icon={ICONS.check}
                        className="primary"
                        onClick={() => {
                            if (this.m_input === null || this.m_input.value.trim().length === 0) {
                                PopupsContainer.alertPopup(
                                    "Warning!",
                                    `Selector field "when" should not be empty.`
                                );
                                return;
                            }
                            techniqueData.when = this.m_input.value.trim();
                            this.m_input.value = "";
                            this.setState({ techniqueData });
                        }}
                    />
                </div>
            );
        } else if (techniqueData.description === undefined) {
            currentPage = (
                <div>
                    <h3>Set description</h3>
                    <input
                        className="popup-input"
                        type="text"
                        ref={elem => (this.m_input = elem)}
                        defaultValue={techniqueData.description}
                    />
                    <ButtonIcon
                        icon={ICONS.check}
                        className="primary"
                        onClick={() => {
                            if (this.m_input === null || this.m_input.value.trim().length === 0) {
                                PopupsContainer.alertPopup(
                                    "Warning!",
                                    "Please add some description."
                                );
                                return;
                            }
                            techniqueData.description = this.m_input.value.trim();
                            this.m_input.value = "";
                            this.addStyle();
                        }}
                    />
                </div>
            );
        }

        return <div id="create-technique">{currentPage}</div>;
    }
}
