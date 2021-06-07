import React from 'react';

interface SmartBoxProps {
    left?: number | string;
    top?: number | string;
    width?: number | string;
    height?: number | string;
    outlineStyle?: string;
    outlineOffset?: number | string;
}

interface SmartBoxState {
    left: number | string;
    top: number | string;
    width: number | string;
    height: number | string;
    dragging: boolean;
}

function isNullOrUndefined(obj: any) {
    if (obj === undefined || obj === null)
        return true;
    return false;
}

export default class SmartBox extends React.Component<SmartBoxProps, SmartBoxState> {
    static defaultProps: Partial<SmartBoxProps> = {
        left: "7%",
        top: "7%",
        width: "7%",
        height: "7%",
        outlineStyle: "red dashed 1px",
        outlineOffset: -1
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
        this.setState({ ...this.state, dragging: false });
        window.removeEventListener("mouseup", this.mouseUp);
        window.removeEventListener("mousemove", this.mouseMove);
    }

    mouseMove(e: MouseEvent) {
        //console.log("move", this, e);
        if (this.state.dragging && this.div) {
            const dx = e.clientX - (this.div.parentElement?.clientLeft || 0) - this.targetOffsetX;
            const dy = e.clientY - (this.div.parentElement?.clientTop || 0) - this.targetOffsetY;
            this.setState({ ...this.state, left: dx, top: dy });
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
                width: this.props.width,
                height: this.props.height,
                outline: this.props.outlineStyle,
                outlineOffset: this.props.outlineOffset,
                background: "transparent"
            }}
            onMouseDown={e => {
                //console.log("down", this, e);
                this.targetOffsetX = e.clientX - this.div!.getBoundingClientRect().left;
                this.targetOffsetY = e.clientY - this.div!.getBoundingClientRect().top;
                this.setState({ ...this.state, dragging: true });
                window.addEventListener("mouseup", this.mouseUp);
                window.addEventListener("mousemove", this.mouseMove);
                e.preventDefault();
            }}
        >
            {this.props.children}
        </div>;
    }
}
