# ReactSmartBox
React component to drag, resize and rotate

Since package has not been yet published on npm, to install component you need to copy one file to your project and import as usually.

### File:<br />
`ReactSmartBox/clientapp/src/SmartBox.tsx`  

### Import:<br />
```javascript
import SmartBox from './SmartBox';
```

### Demo:<br />
![](https://github.com/A77X7/ReactSmartBox/raw/master/ReactSmartBox/clientapp/Demo/demo.gif)  

### Props:<br />
`defaultLeft?: number`  
Default left position in pixels  
  
`defaultTop?: number`  
Default top position in pixels  
  
`defaultWidth?: number`  
Default width in pixels  
  
`defaultHeight?: number`  
Default height in pixels  
  
`outlineColor?: string`  
Outline color in CSS syntax  
  
`outlineStyle?: string`  
Outline style in CSS syntax  
  
`outlineWidth?: number | string`  
Outline width in CSS syntax  
  
`outlineOffset?: number | string`  
Outline offset in CSS syntax  
  
`handleSizePx?: number`  
Sizing/rotating handles size in pixels  
  
`defaultAngle?: number`  
Default rotation angle in degrees  
  
`style?: React.CSSProperties`  
Style overrides for container div  
  
`disableSizing?: SizingType[]`  
Disable individual sizing handles. Allowed values:  
```typescript
type SizingType = "right" | "right-top" | "top" | "left-top" | "left" | "left-bottom" | "bottom" | "right-bottom";
```
  
`disableAllSizing?: boolean`  
`true` to disable all sizing handles  
  
`disableRotating?: boolean`  
`true` to disable rotating  
  
`disableDragging?: boolean`  
`true` to disable dragging along all axises  
  
`disableHorizontalDragging?: boolean`  
`true` to disable dragging horizontally  
  
`disableVerticalDragging?: boolean`  
`true` to disable dragging vertically  

All the events has same signature - original mouse event and copy of component state.  
Each action has three events for begin, continue and end:  
```typescript
onDraggingBegin?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, state: SmartBoxState) => void  
onDragging?: (e: MouseEvent, state: SmartBoxState) => void  
onDraggingEnd?: (e: MouseEvent, state: SmartBoxState) => void  
onSizingBegin?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, state: SmartBoxState) => void  
onSizing?: (e: MouseEvent, state: SmartBoxState) => void  
onSizingEnd?: (e: MouseEvent, state: SmartBoxState) => void  
onRotatingBegin?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, state: SmartBoxState) => void  
onRotating?: (e: MouseEvent, state: SmartBoxState) => void  
onRotatingEnd?: (e: MouseEvent, state: SmartBoxState) => void  
```
State type:  
```typescript
interface SmartBoxState {
    left: number;
    top: number;
    width: number;
    height: number;
    dragging: boolean;
    sizing?: SizingType;
    rotating: boolean;
    angle: number;
}
```
