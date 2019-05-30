/*
 * Copyright (C) 2017-2019 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import JSONTree from "react-json-tree";
import { TechniqueData, WhenPropsData } from "../../types";
import ButtonIcon, { ICONS } from "../components/ButtonIcon";
import MapHandler from "../map-handler";
import { geometryList } from "../map-handler/MapGeometryList";
import Menu from "./Menu";

interface Props {
    done: () => void;
}

export default class extends React.Component<Props> {
    render() {
        return (
            <div className="geometries-list-popup-content-wrapper">
                <JSONTree
                    data={geometryList}
                    sortObjectKeys={true}
                    hideRoot={true}
                    getItemString={(type, data, itemType, itemString) => {
                        if (
                            (data as WhenPropsData).$layer &&
                            (data as WhenPropsData).$geometryType
                        ) {
                            const styleData = new TechniqueData();
                            styleData.when = MapHandler.whenFromKeyVal(data as WhenPropsData);
                            styleData.layer = (data as WhenPropsData).$layer;
                            styleData.geometryType = (data as WhenPropsData).$geometryType;
                            return (
                                <span>
                                    {itemType} {itemString}{" "}
                                    <ButtonIcon
                                        className="small"
                                        icon={ICONS.magicStick}
                                        title="Create new style"
                                        onClick={() => {
                                            Menu.openNewTechniquePopup(styleData);
                                            this.props.done();
                                        }}
                                    />
                                </span>
                            );
                        }
                        return (
                            <span>
                                {itemType} {itemString}
                            </span>
                        );
                    }}
                />
            </div>
        );
    }
}
