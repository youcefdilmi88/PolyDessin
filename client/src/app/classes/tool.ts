import { Vec2 } from '@classes/vec2';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

// Ceci est justifié vu que c'est une classe abstraite et que les méthodes seront implémentées dans les classes enfant
// tslint:disable:no-empty

export abstract class Tool {
    constructor(protected drawingService: DrawingService) {}

    toolName: ToolName;
    mouseDownCoord: Vec2;
    mousePosition: Vec2;
    mouseDown: boolean;

    onMouseDown(event: MouseEvent): void {}
    onMouseUp(event: MouseEvent): void {}
    onMouseMove(event: MouseEvent): void {}
    onDoubleClick(event: MouseEvent): void {}
    onMouseWheel(event: WheelEvent): void {}

    onKeyPress(event: KeyboardEvent): void {}
    onKeyRelease(event: KeyboardEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
}
