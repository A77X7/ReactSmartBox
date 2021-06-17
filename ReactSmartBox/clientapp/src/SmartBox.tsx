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
        handleSizePx: 8,
        angle: 0
    }

    mouseDownEvent?: React.MouseEvent<HTMLDivElement, MouseEvent>;
    centerOffsetX: number = 0;
    centerOffsetY: number = 0;
    oldRotatedLeft: number = 0;
    oldRotatedTop: number = 0;
    oldRotatedRight: number = 0;
    oldRotatedBottom: number = 0;

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
        this.setState({ ...this.state, dragging: false, sizing: undefined });
        window.removeEventListener("mouseup", this.mouseUp);
        window.removeEventListener("mousemove", this.mouseMove);
    }

    mouseMove(e: MouseEvent) {
        //console.log("move", this, e);
        if (this.state.dragging && this.div) {
            const newCenterX = e.clientX - this.centerOffsetX;
            const newCenterY = e.clientY - this.centerOffsetY;
            const newLeft = newCenterX + this.state.width / 2;
            const newTop = newCenterY + this.state.height / 2;
            this.setState({ ...this.state, left: newLeft, top: newTop });
        } else if (this.state.sizing === "right-bottom" && this.div) {
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
        } else if (this.state.sizing === "left-top" && this.div) {
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
        } else if (this.state.sizing === "right-top" && this.div) {
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
        } else if (this.state.sizing === "left-bottom" && this.div) {
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
    render() {
        const rotatePos = this.getRotatingHandlePosition();
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
                console.log("down", this, e);
                this.mouseDownEvent = e;
                this.centerOffsetX = e.clientX - this.state.left + this.state.width / 2;
                this.centerOffsetY = e.clientY - this.state.top + this.state.height / 2;
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
                onMouseDown={e => {
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
                onMouseDown={e => {
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
                onMouseDown={e => {
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
                onMouseDown={e => {
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
                onMouseDown={e => {
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
            top: 0 - this.props.handleSizePx! * 4
        };
    }
}
