import React from 'react';

interface SmartBoxProps {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    outlineColor?: string;
    outlineStyle?: string;
    outlineWidth?: number | string;
    outlineOffset?: number | string;
    handleSizePx?: number;
}

interface SmartBoxState {
    left: number;
    top: number;
    width: number;
    height: number;
    dragging: boolean;
    sizing?: "right" | "right-top" | "top" | "left-top" | "left" | "left-bottom" | "bottom" | "right-bottom";
}

function isNullOrUndefined(obj: any) {
    if (obj === undefined || obj === null)
        return true;
    return false;
}

export default class SmartBox extends React.Component<SmartBoxProps, SmartBoxState> {
    static defaultProps: Partial<SmartBoxProps> = {
        left: 50,
        top: 50,
        width: 50,
        height: 50,
        outlineColor: "red",
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineOffset: -1,
        handleSizePx: 8
    }

    targetOffsetX: number = 0;
    targetOffsetY: number = 0;

    constructor(props: SmartBoxProps) {
        super(props);
        this.state = {
            left: isNullOrUndefined(props.left) ? SmartBox.defaultProps.left! : props.left!,
            top: isNullOrUndefined(props.top) ? SmartBox.defaultProps.top! : props.top!,
            width: isNullOrUndefined(props.width) ? SmartBox.defaultProps.width! : props.width!,
            height: isNullOrUndefined(props.height) ? SmartBox.defaultProps.height! : props.height!,
            dragging: false
        };
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }

    mouseUp(e: MouseEvent) {
        //console.log("up", this, e);
        this.setState({ ...this.state, dragging: false, sizing: undefined });
        window.removeEventListener("mouseup", this.mouseUp);
        window.removeEventListener("mousemove", this.mouseMove);
    }

    mouseMove(e: MouseEvent) {
        //console.log("move", this, e);
        if (this.state.dragging && this.div) {
            const dx = e.clientX - (this.div.parentElement?.clientLeft || 0) - this.targetOffsetX;
            const dy = e.clientY - (this.div.parentElement?.clientTop || 0) - this.targetOffsetY;
            this.setState({ ...this.state, left: dx, top: dy });
        } else if (this.state.sizing === "right-bottom" && this.div) {
            const w = e.clientX - (this.div.getBoundingClientRect().left || 0);
            const h = e.clientY - (this.div.getBoundingClientRect().top || 0);
            this.setState({ ...this.state, width: w, height: h });
        }
    }

    div?: HTMLDivElement;
    render() {
        return <div
            ref={r => this.div = r || undefined}
            style={{
                position: "absolute",
                cursor: "all-scroll",
                left: this.state.left,
                top: this.state.top,
                width: this.state.width,
                height: this.state.height,
                outlineColor: this.props.outlineColor,
                outlineStyle: this.props.outlineStyle,
                outlineWidth: this.props.outlineWidth,
                outlineOffset: this.props.outlineOffset,
                background: "transparent"
            }}
            onMouseDown={e => {
                console.log("down", this, e);
                this.targetOffsetX = e.clientX - this.div!.getBoundingClientRect().left;
                this.targetOffsetY = e.clientY - this.div!.getBoundingClientRect().top;
                this.setState({ ...this.state, dragging: true });
                window.addEventListener("mouseup", this.mouseUp);
                window.addEventListener("mousemove", this.mouseMove);
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            {this.props.children}
            {/*Corners*/}
            <div
                //left top
                style={{
                    position: "absolute",
                    left: 0 - this.props.handleSizePx! / 2,
                    top: 0 - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            <div
                //right top
                style={{
                    position: "absolute",
                    left: this.state.width - this.props.handleSizePx! / 2,
                    top: 0 - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            <div
                //left bottom
                style={{
                    position: "absolute",
                    left: 0 - this.props.handleSizePx! / 2,
                    top: this.state.height - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            <div
                //right bottom
                style={{
                    position: "absolute",
                    left: this.state.width - this.props.handleSizePx! / 2,
                    top: this.state.height - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
                onMouseDown={e => {
                    console.log("down right-bottom", this, e);
                    this.targetOffsetX = e.clientX - this.div!.getBoundingClientRect().left;
                    this.targetOffsetY = e.clientY - this.div!.getBoundingClientRect().top;
                    this.setState({ ...this.state, sizing: "right-bottom" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            {/*Middles*/}
            <div
                //top
                style={{
                    position: "absolute",
                    left: this.state.width / 2 - this.props.handleSizePx! / 2,
                    top: 0 - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            <div
                //bottom
                style={{
                    position: "absolute",
                    left: this.state.width / 2 - this.props.handleSizePx! / 2,
                    top: this.state.height - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            <div
                //left
                style={{
                    position: "absolute",
                    left: 0 - this.props.handleSizePx! / 2,
                    top: this.state.height / 2 - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            <div
                //right
                style={{
                    position: "absolute",
                    left: this.state.width - this.props.handleSizePx! / 2,
                    top: this.state.height / 2 - this.props.handleSizePx! / 2,
                    width: this.props.handleSizePx,
                    height: this.props.handleSizePx,
                    outlineColor: this.props.outlineColor,
                    outlineStyle: "solid",
                    outlineWidth: 1,
                    outlineOffset: -1
                }}
            />
            {/*Rotate*/}
            <div
                //top
                style={{
                    position: "absolute",
                    left: this.state.width / 2 - this.props.handleSizePx! / 2,
                    top: 0 - this.props.handleSizePx! * 4,
                    width: this.props.handleSizePx! - 1,
                    height: this.props.handleSizePx! - 1,
                    borderColor: this.props.outlineColor,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderRadius: "50%"
                }}
            />
        </div>;
    }
}
