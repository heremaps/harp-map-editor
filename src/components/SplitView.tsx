/*
 * Copyright (C) 2017-2020 HERE Europe B.V.
 * Licensed under Apache 2.0, see full license in LICENSE
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";

type Mode = "horizontal" | "vertical";

interface Props {
    section_a: JSX.Element | string;
    section_b: JSX.Element | string;
    mode: Mode;
    separatorPosition: number;
    onChange?: (size: number) => void;
    onResizing?: (size: number) => void;
    safeGap?: number;
    separatorSize?: number;
}

interface DragStartPosition {
    x: number;
    y: number;
}

interface State {
    dragStartPosition: DragStartPosition | null;
}

export default class extends React.Component<Props, State> {
    private onSeparatorDragStart: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    private onSeparatorDragStop: (event: MouseEvent) => void;
    private onSeparatorDrag: (event: MouseEvent) => void;
    private onResize: () => void;
    private m_container: HTMLDivElement | null = null;
    private m_section_a: HTMLElement | null = null;
    private m_section_b: HTMLElement | null = null;
    private m_separator: HTMLDivElement | null = null;
    private m_safeGap: number;
    private m_separatorSize: number;
    private m_separatorPosition: number;
    private m_separatorPositionStart = 0;

    constructor(props: Props) {
        super(props);

        this.m_safeGap = props.safeGap || 40;
        this.m_separatorSize = props.separatorSize || 4;
        this.m_separatorPosition = props.separatorPosition || 4;

        this.state = {
            dragStartPosition: null,
        };

        this.onSeparatorDragStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            this.setState({
                dragStartPosition: {
                    x: event.clientX,
                    y: event.clientY,
                },
            });

            this.m_separatorPositionStart = this.m_separatorPosition;

            window.addEventListener("mousemove", this.onSeparatorDrag);

            event.preventDefault();
            event.stopPropagation();
        };

        this.onSeparatorDragStop = (event: MouseEvent) => {
            if (!this.state.dragStartPosition === null) {
                return;
            }

            window.removeEventListener("mousemove", this.onSeparatorDrag);

            this.onSeparatorDrag(event);
            this.setState({ dragStartPosition: null });

            if (this.props.onChange !== undefined) {
                this.props.onChange(this.m_separatorPosition);
            }
        };

        this.onSeparatorDrag = (event: MouseEvent) => {
            if (!this.state.dragStartPosition) {
                return;
            }

            const pos = { x: event.clientX, y: event.clientY };
            const startPos = this.state.dragStartPosition;
            let separatorPosition = this.m_separatorPositionStart;

            switch (this.props.mode) {
                case "horizontal":
                    separatorPosition += pos.x - startPos.x;
                    break;
                    break;
                case "vertical":
                    separatorPosition += pos.y - startPos.y;
                    break;
            }

            this.setSizes(separatorPosition);
            event.preventDefault();
            event.stopPropagation();
        };

        this.onResize = () => {
            this.setSizes(this.m_separatorPosition);
        };
    }

    componentDidMount() {
        window.addEventListener("mouseup", this.onSeparatorDragStop);
        window.addEventListener("mouseleave", this.onSeparatorDragStop);
        window.addEventListener("resize", this.onResize);
        this.setSizes(this.m_separatorPosition);
    }

    componentWillUnmount() {
        window.removeEventListener("mouseup", this.onSeparatorDragStop);
        window.removeEventListener("mouseleave", this.onSeparatorDragStop);
        window.removeEventListener("resize", this.onResize);
    }

    render() {
        this.setSizes(this.m_separatorPosition);

        const mouseCatcher =
            this.state.dragStartPosition === null ? null : <div className="mouse-catcher" />;

        return (
            <div
                className={`split-view ${this.props.mode}`}
                ref={(node) => (this.m_container = node)}
            >
                <section ref={(node) => (this.m_section_a = node)}>{this.props.section_a}</section>
                <section ref={(node) => (this.m_section_b = node)}>{this.props.section_b}</section>
                <div
                    onMouseDown={this.onSeparatorDragStart}
                    className="separator"
                    ref={(node) => (this.m_separator = node)}
                />
                {mouseCatcher}
            </div>
        );
    }

    private setSizes(size: number) {
        const { m_container, m_section_a, m_section_b, m_separator } = this;

        if (
            m_container === null ||
            m_section_a === null ||
            m_section_b === null ||
            m_separator === null
        ) {
            return;
        }

        const rect = m_container.getBoundingClientRect();
        size = Math.max(size, this.m_safeGap);
        let maxSize = 0;
        switch (this.props.mode) {
            case "horizontal":
                size = Math.min(size, rect.width - this.m_safeGap - this.m_separatorSize);
                maxSize = rect.width;
                break;
            case "vertical":
                size = Math.min(size, rect.height - this.m_safeGap - this.m_separatorSize);
                maxSize = rect.height;
                break;
        }

        const propFirst = this.props.mode === "horizontal" ? "left" : "top";
        const propSecond = this.props.mode === "horizontal" ? "right" : "bottom";

        for (const element of [m_section_a, m_section_b, m_separator]) {
            element.style.left = "0";
            element.style.right = "0";
            element.style.top = "0";
            element.style.bottom = "0";
        }

        m_section_a.style[propSecond] = `${maxSize - size}px`;

        m_separator.style[propFirst] = `${size}px`;
        m_separator.style[propSecond] = `${maxSize - size - this.m_separatorSize}px`;

        m_section_b.style[propFirst] = `${size + this.m_separatorSize}px`;

        this.m_separatorPosition = size;

        if (this.props.onResizing) {
            this.props.onResizing(this.m_separatorPosition);
        }
    }
}
