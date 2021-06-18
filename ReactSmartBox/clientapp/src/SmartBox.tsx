﻿import React from 'react';

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
    angle?: number;
    style?: React.CSSProperties;
}

interface SmartBoxState {
    left: number;
    top: number;
    width: number;
    height: number;
    dragging: boolean;
    sizing?: "right" | "right-top" | "top" | "left-top" | "left" | "left-bottom" | "bottom" | "right-bottom";
    rotating: boolean;
    angle: number;
}

function isNullOrUndefined(obj: any) {
    if (obj === undefined || obj === null)
        return true;
    return false;
}

function rotate(x: number, y: number, cx: number, cy: number, a: number) {
    const cos = Math.cos, sin = Math.sin;
    a = a * Math.PI / 180;

    const xr = (x - cx) * cos(a) - (y - cy) * sin(a) + cx;
    const yr = (x - cx) * sin(a) + (y - cy) * cos(a) + cy;

    return { x: xr, y: yr };
}

function middle(x1: number, y1: number, x2: number, y2: number) {
    return {
        x: x1 + (x2 - x1) / 2,
        y: y1 + (y2 - y1) / 2
    };
}

function center(rect: { left: number, top: number, width: number, height: number }) {
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

/**
 * https://jsfiddle.net/justin_c_rounds/Gd2S2/light/
 * @param line1StartX
 * @param line1StartY
 * @param line1EndX
 * @param line1EndY
 * @param line2StartX
 * @param line2StartY
 * @param line2EndX
 * @param line2EndY
 */
function intersect(line1StartX: number, line1StartY: number, line1EndX: number, line1EndY: number, line2StartX: number, line2StartY: number, line2EndX: number, line2EndY: number) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    const result = {
        x: null as null | number,
        y: null as null | number,
        onLine1: false,
        onLine2: false
    };
    const denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    let a = line1StartY - line2StartY;
    let b = line1StartX - line2StartX;
    const numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    const numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
            // it is worth noting that this should be the same as:
            x = line2StartX + (b * (line2EndX - line2StartX));
            y = line2StartX + (b * (line2EndY - line2StartY));
            */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function length(x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export default class SmartBox extends React.Component<SmartBoxProps, SmartBoxState> {
    static defaultProps: Partial<SmartBoxProps> = {
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        outlineColor: "red",
        outlineStyle: "dashed",
        outlineWidth: 1,
        outlineOffset: -1,
        handleSizePx: 10,
        angle: 0
    }

    mouseDownEvent?: React.MouseEvent<HTMLDivElement, MouseEvent>;
    centerOffsetX: number = 0;
    centerOffsetY: number = 0;
    oldRotatedLeft: number = 0;
    oldRotatedTop: number = 0;
    oldRotatedRight: number = 0;
    oldRotatedBottom: number = 0;

    oldOppositeRotatedX: number = 0;
    oldOppositeRotatedY: number = 0;

    constructor(props: SmartBoxProps) {
        super(props);
        this.state = {
            left: isNullOrUndefined(props.left) ? SmartBox.defaultProps.left! : props.left!,
            top: isNullOrUndefined(props.top) ? SmartBox.defaultProps.top! : props.top!,
            width: isNullOrUndefined(props.width) ? SmartBox.defaultProps.width! : props.width!,
            height: isNullOrUndefined(props.height) ? SmartBox.defaultProps.height! : props.height!,
            dragging: false,
            rotating: false,
            angle: props.angle || SmartBox.defaultProps.angle!
        };
        this.mouseMove = this.mouseMove.bind(this);
        this.mouseUp = this.mouseUp.bind(this);
    }

    mouseUp(e: MouseEvent) {
        //console.log("up", this, e);
        //if (this.mouseMoved && this.state.dragging) {
        //    //console.log("cancel mouse up due was dragging");
        //    e.preventDefault(); // to prevent text (or other content) selection
        //    e.stopPropagation();
        //    e.stopImmediatePropagation();
        //}
        //this.mouseMoved = false;
        this.setState({ ...this.state, dragging: false, sizing: undefined, rotating: false });
        window.removeEventListener("mouseup", this.mouseUp);
        window.removeEventListener("mousemove", this.mouseMove);
    }

    //mouseMoved = false;
    mouseMove(e: MouseEvent) {
        //console.log("move", this, e);
        e.preventDefault(); // to prevent text (or other content) selection
        if (!e.movementX && !e.movementY)
            return;
        //this.mouseMoved = true;
        //console.log("moved", this, e);
        if (this.state.dragging) {
            const newCenterX = e.clientX - this.centerOffsetX;
            const newCenterY = e.clientY - this.centerOffsetY;
            const newLeft = newCenterX + this.state.width / 2;
            const newTop = newCenterY + this.state.height / 2;
            this.setState({ ...this.state, left: newLeft, top: newTop });
        } else if (this.state.sizing === "right-bottom") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            //*1
            //const bb = this.div.getBoundingClientRect();
            //const oldCenterX = bb.left + bb.width / 2;
            //const oldCenterY = bb.top + bb.height / 2;            
            //const oldLeft = oldCenterX - this.state.width / 2;
            //const oldTop = oldCenterY - this.state.height / 2;

            //*1
            //из-за (недостаточной) точности, вычисления этим методом приводят к тому, что левый верхний угол ползёт в процессе движения мышью
            //поэтому координаты левого верхнего угла фиксируются в событии mousedown
            //заодно здесь будет меньше вычислений, и это хорошо
            //const { x: oldRotatedLeft, y: oldRotatedTop } = rotate(oldLeft, oldTop, oldCenterX, oldCenterY, this.state.angle);

            //новый центр
            const { x: newCenterX, y: newCenterY } = middle(this.oldRotatedLeft, this.oldRotatedTop, e.clientX, e.clientY);
            //координаты мыши без поворота
            const { x: unrotatedX, y: unrotatedY } = rotate(e.clientX, e.clientY, newCenterX, newCenterY, -this.state.angle);

            //новый левый верхний угол без поворота
            //*1
            //const { x: newOldLeft, y: newOldTop } = rotate(oldRotatedLeft, oldRotatedTop, newCenterX, newCenterY, -this.state.angle);
            const { x: newLeft, y: newTop } = rotate(this.oldRotatedLeft, this.oldRotatedTop, newCenterX, newCenterY, -this.state.angle);

            const newWidth = unrotatedX - newLeft;
            const newHeight = unrotatedY - newTop;

            this.setState({ ...this.state, width: newWidth, height: newHeight, left: newLeft, top: newTop });
        } else if (this.state.sizing === "left-top") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            //новый центр
            const { x: newCenterX, y: newCenterY } = middle(e.clientX, e.clientY, this.oldRotatedRight, this.oldRotatedBottom);
            //координаты мыши без поворота
            const { x: unrotatedX, y: unrotatedY } = rotate(e.clientX, e.clientY, newCenterX, newCenterY, -this.state.angle);

            //новый правый нижний угол без поворота
            const { x: newRight, y: newBottom } = rotate(this.oldRotatedRight, this.oldRotatedBottom, newCenterX, newCenterY, -this.state.angle);

            const newWidth = newRight - unrotatedX;
            const newHeight = newBottom - unrotatedY;

            this.setState({ ...this.state, width: newWidth, height: newHeight, left: unrotatedX, top: unrotatedY });
        } else if (this.state.sizing === "right-top") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            //новый центр
            const { x: newCenterX, y: newCenterY } = middle(e.clientX, e.clientY, this.oldRotatedLeft, this.oldRotatedBottom);
            //координаты мыши без поворота
            const { x: unrotatedX, y: unrotatedY } = rotate(e.clientX, e.clientY, newCenterX, newCenterY, -this.state.angle);

            //новый левый нижний угол без поворота
            const { x: newLeft, y: newBottom } = rotate(this.oldRotatedLeft, this.oldRotatedBottom, newCenterX, newCenterY, -this.state.angle);

            const newWidth = unrotatedX - newLeft;
            const newHeight = newBottom - unrotatedY;

            this.setState({ ...this.state, width: newWidth, height: newHeight, left: newLeft, top: unrotatedY });
        } else if (this.state.sizing === "left-bottom") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            //новый центр
            const { x: newCenterX, y: newCenterY } = middle(e.clientX, e.clientY, this.oldRotatedRight, this.oldRotatedTop);
            //координаты мыши без поворота
            const { x: unrotatedX, y: unrotatedY } = rotate(e.clientX, e.clientY, newCenterX, newCenterY, -this.state.angle);

            //новый правый верхний угол без поворота
            const { x: newRight, y: newTop } = rotate(this.oldRotatedRight, this.oldRotatedTop, newCenterX, newCenterY, -this.state.angle);

            const newWidth = newRight - unrotatedX;
            const newHeight = unrotatedY - newTop;

            this.setState({ ...this.state, width: newWidth, height: newHeight, left: unrotatedX, top: newTop });
        } else if (this.state.sizing === "top") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            const oldCenter = center(this.div!.getBoundingClientRect());
            const newOldUnrotatedMouse = rotate(e.clientX, e.clientY, oldCenter.x, oldCenter.y, -this.state.angle);
            const newRotatedLeftTop = rotate(this.state.left, newOldUnrotatedMouse.y, oldCenter.x, oldCenter.y, this.state.angle);
            const newRotatedTop = rotate(oldCenter.x, newOldUnrotatedMouse.y, oldCenter.x, oldCenter.y, this.state.angle);
            const newCenter = middle(newRotatedTop.x, newRotatedTop.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            const newLeftTop = rotate(newRotatedLeftTop.x, newRotatedLeftTop.y, newCenter.x, newCenter.y, -this.state.angle);
            const newHeight = length(newRotatedTop.x, newRotatedTop.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            this.setState({ ...this.state, left: newLeftTop.x, top: newLeftTop.y, height: newHeight });
        } else if (this.state.sizing === "left") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            const oldCenter = center(this.div!.getBoundingClientRect());
            const newOldUnrotatedMouse = rotate(e.clientX, e.clientY, oldCenter.x, oldCenter.y, -this.state.angle);
            const newRotatedLeftTop = rotate(newOldUnrotatedMouse.x, this.state.top, oldCenter.x, oldCenter.y, this.state.angle);
            const newRotatedLeft = rotate(newOldUnrotatedMouse.x, oldCenter.y, oldCenter.x, oldCenter.y, this.state.angle);
            const newCenter = middle(newRotatedLeft.x, newRotatedLeft.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            const newLeftTop = rotate(newRotatedLeftTop.x, newRotatedLeftTop.y, newCenter.x, newCenter.y, -this.state.angle);
            const newWidth = length(newRotatedLeft.x, newRotatedLeft.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            this.setState({ ...this.state, left: newLeftTop.x, top: newLeftTop.y, width: newWidth });
        } else if (this.state.sizing === "bottom") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            const oldCenter = center(this.div!.getBoundingClientRect());
            const newOldUnrotatedMouse = rotate(e.clientX, e.clientY, oldCenter.x, oldCenter.y, -this.state.angle);
            const newRotatedLeftTop = rotate(this.state.left, this.state.top, oldCenter.x, oldCenter.y, this.state.angle);//change to bb ??
            const newRotatedLeft = rotate(oldCenter.x, newOldUnrotatedMouse.y, oldCenter.x, oldCenter.y, this.state.angle);
            const newCenter = middle(newRotatedLeft.x, newRotatedLeft.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            const newLeftTop = rotate(newRotatedLeftTop.x, newRotatedLeftTop.y, newCenter.x, newCenter.y, -this.state.angle);
            const newHeight = length(newRotatedLeft.x, newRotatedLeft.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            this.setState({ ...this.state, left: newLeftTop.x, top: newLeftTop.y, height: newHeight });
        } else if (this.state.sizing === "right") {
            //чтобы вычислить новые ширину и высоту, поворачиваем обратно, чтобы вычисления были при угле равном нулю...

            const oldCenter = center(this.div!.getBoundingClientRect());
            const newOldUnrotatedMouse = rotate(e.clientX, e.clientY, oldCenter.x, oldCenter.y, -this.state.angle);
            const newRotatedLeftTop = rotate(this.state.left, this.state.top, oldCenter.x, oldCenter.y, this.state.angle);//change to bb ??
            const newRotatedLeft = rotate(newOldUnrotatedMouse.x, oldCenter.y, oldCenter.x, oldCenter.y, this.state.angle);
            const newCenter = middle(newRotatedLeft.x, newRotatedLeft.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            const newLeftTop = rotate(newRotatedLeftTop.x, newRotatedLeftTop.y, newCenter.x, newCenter.y, -this.state.angle);
            const newWidth = length(newRotatedLeft.x, newRotatedLeft.y, this.oldOppositeRotatedX, this.oldOppositeRotatedY);
            this.setState({ ...this.state, left: newLeftTop.x, top: newLeftTop.y, width: newWidth });
        } else if (this.state.rotating && this.div) {
            //console.log("move rotate", e);
            //центр
            const bb = this.div.getBoundingClientRect();
            const centerX = bb.left + bb.width / 2;
            const centerY = bb.top + bb.height / 2;

            //смещение мыши относительно центра ручки (handle)
            //неправильно... ну и ладно, и так норм
            //const bbRotateHandle = this.divRotate!.getBoundingClientRect();
            //const rotateHandleCenterX = bbRotateHandle.left + bbRotateHandle.width / 2;
            //const rotateHandleCenterY = bbRotateHandle.top + bbRotateHandle.height / 2;
            //const mDx = this.mouseDownEvent!.clientX - rotateHandleCenterX;
            //const mDy = this.mouseDownEvent!.clientY - rotateHandleCenterY;

            //катеты
            const a = e.clientY - centerY;
            const b = e.clientX - centerX;
            //тангенс нового угла, рад
            const tnA = Math.abs(b / a);
            //новый угол, градусы
            let newAngle = Math.atan(tnA) * 180 / Math.PI;
            //коррекция по четвертям
            //TODO: надо переделать, наверное
            if (a > 0) {
                if (b > 0)
                    newAngle -= 180;
                else
                    newAngle += 180;
            } else if (a == 0) {
                if (b < 0)
                    newAngle -= 180;
            }
            if (b < 0 && a < 0 || b > 0 && a > 0)
                newAngle *= -1;
            if (newAngle < 0)
                newAngle += 360;
            //console.log("new angle", newAngle);
            this.setState({ ...this.state, angle: newAngle });
        }
    }

    div?: HTMLDivElement;
    divRotate?: HTMLDivElement;
    divLeftTop?: HTMLDivElement;
    divRightBottom?: HTMLDivElement;
    divRightTop?: HTMLDivElement;
    divLeftBottom?: HTMLDivElement;
    divLeft?: HTMLDivElement;
    divRight?: HTMLDivElement;
    divTop?: HTMLDivElement;
    divBottom?: HTMLDivElement;
    render() {
        const rotatePos = this.getRotatingHandlePosition();
        const sizeTitle = `${this.state.width} x ${this.state.height}`;
        return <div
            ref={r => this.div = r || undefined}
            style={{
                outlineColor: this.props.outlineColor,
                outlineStyle: this.props.outlineStyle,
                outlineWidth: this.props.outlineWidth,
                outlineOffset: this.props.outlineOffset,
                background: "transparent",
                cursor: "all-scroll",
                ...this.props.style,
                position: "absolute",
                left: this.state.left,
                top: this.state.top,
                width: this.state.width,
                height: this.state.height,
                transform: `rotate(${this.state.angle}deg)`,
            }}
            onMouseDown={e => {
                if (e.button != 0 || e.shiftKey || e.altKey || e.ctrlKey)
                    return;
                console.log("down", this, e);
                this.mouseDownEvent = e;
                this.centerOffsetX = e.clientX - this.state.left + this.state.width / 2;
                this.centerOffsetY = e.clientY - this.state.top + this.state.height / 2;
                this.setState({ ...this.state, dragging: true });
                window.addEventListener("mouseup", this.mouseUp);
                window.addEventListener("mousemove", this.mouseMove);
                //e.preventDefault();
                //e.stopPropagation();
            }}
        >
            {this.props.children}
            {/*Corners*/}
            <div
                //left top
                ref={r => this.divLeftTop = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down right-bottom", this, e);
                    const c = center(this.divRightBottom!.getBoundingClientRect());
                    this.oldRotatedRight = c.x;
                    this.oldRotatedBottom = c.y;
                    this.setState({ ...this.state, sizing: "left-top" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            <div
                //right top
                ref={r => this.divRightTop = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down right-top", this, e);
                    const c = center(this.divLeftBottom!.getBoundingClientRect());
                    this.oldRotatedLeft = c.x;
                    this.oldRotatedBottom = c.y;
                    this.setState({ ...this.state, sizing: "right-top" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            <div
                //left bottom
                ref={r => this.divLeftBottom = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down right-top", this, e);
                    const c = center(this.divRightTop!.getBoundingClientRect());
                    this.oldRotatedRight = c.x;
                    this.oldRotatedTop = c.y;
                    this.setState({ ...this.state, sizing: "left-bottom" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            <div
                //right bottom
                ref={r => this.divRightBottom = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down right-bottom", this, e);
                    const c = center(this.divLeftTop!.getBoundingClientRect());
                    this.oldRotatedLeft = c.x;
                    this.oldRotatedTop = c.y;
                    this.setState({ ...this.state, sizing: "right-bottom" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            {/*Middles (of edges)*/}
            <div
                //top
                ref={r => this.divTop = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down top", this, e);
                    const c = center(this.divBottom!.getBoundingClientRect());
                    this.oldOppositeRotatedX = c.x;
                    this.oldOppositeRotatedY = c.y;
                    this.setState({ ...this.state, sizing: "top" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            <div
                //bottom
                ref={r => this.divBottom = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down bottom", this, e);
                    const c = center(this.divTop!.getBoundingClientRect());
                    this.oldOppositeRotatedX = c.x;
                    this.oldOppositeRotatedY = c.y;
                    this.setState({ ...this.state, sizing: "bottom" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            <div
                //left
                ref={r => this.divLeft = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down left", this, e);
                    const c = center(this.divRight!.getBoundingClientRect());
                    this.oldOppositeRotatedX = c.x;
                    this.oldOppositeRotatedY = c.y;
                    this.setState({ ...this.state, sizing: "left" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            <div
                //right
                ref={r => this.divRight = r || undefined}
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
                title={sizeTitle}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down right", this, e);
                    const c = center(this.divLeft!.getBoundingClientRect());
                    this.oldOppositeRotatedX = c.x;
                    this.oldOppositeRotatedY = c.y;
                    this.setState({ ...this.state, sizing: "right" });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
            {/*Rotate*/}
            <div
                //top
                ref={r => this.divRotate = r || undefined}
                style={{
                    position: "absolute",
                    left: rotatePos.left,
                    top: rotatePos.top,
                    width: this.props.handleSizePx! - 1,
                    height: this.props.handleSizePx! - 1,
                    borderColor: this.props.outlineColor,
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderRadius: "50%",
                    cursor: "alias"
                }}
                title={`Двойной щелчок - установка угла кратного 90 градусам\nAlt + двойной щелчок - кратно 15 градусам\nShift + двойной щелчок - вращение против часовой стрелки кратно 90 или 15 градусам (в зависимости от Alt)\nТекущий угол, градусов - ${this.state.angle}`}
                onMouseDown={e => {
                    if (e.button != 0)
                        return;
                    console.log("down rotate", this, e);
                    this.mouseDownEvent = e;
                    this.setState({ ...this.state, rotating: true });
                    window.addEventListener("mouseup", this.mouseUp);
                    window.addEventListener("mousemove", this.mouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDoubleClick={e => {
                    console.log("dblclick rotate", this, e);
                    let step = e.altKey ? 15 : 90;
                    if (this.state.angle % step === 0) {
                        step *= e.shiftKey ? -1 : 1;
                        this.setState({ ...this.state, angle: (this.state.angle + step + 360) % 360 });
                    } else {
                        this.setState({ ...this.state, angle: 0 });
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }}
            />
        </div>;
    }

    getRotatingHandlePosition() {
        return {
            left: this.state.width / 2 - this.props.handleSizePx! / 2,
            top: 0 - this.props.handleSizePx! * 2
        };
    }
}
