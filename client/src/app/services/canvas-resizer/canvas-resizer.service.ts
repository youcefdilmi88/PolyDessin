import { EventEmitter, Injectable } from '@angular/core';
import { OffsetGrabberCouple } from '@classes/offset-grabber-couple';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { Side } from '@enums/side';

const SIDEBAR_WIDTH = 350;
const MINIMUM_CANVAS_DIMENSIONS = 250;
const HALF_GRABBER_SIZE = 50;
const GRABBER_OFFSET = 3;
const GRABBER_OFFSET_Y = 4;

@Injectable({
    providedIn: 'root',
})
export class CanvasResizerService {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    clickedGrabber: string;
    element: HTMLCanvasElement;
    rightGrabberElement: HTMLElement;
    bottomGrabberElement: HTMLElement;
    cornerGrabberElement: HTMLElement;
    grabberMoveEmitter: EventEmitter<OffsetGrabberCouple> = new EventEmitter<OffsetGrabberCouple>();

    computeCanvasSize(side: Side): number {
        const size = side === Side.Width ? window.innerWidth - SIDEBAR_WIDTH : window.innerHeight;
        return size / 2 < MINIMUM_CANVAS_DIMENSIONS ? MINIMUM_CANVAS_DIMENSIONS : size / 2;
    }

    computeRightGrabberPosition(xSize: number, ySize: number): Vec2 {
        const x = xSize + 1;
        const y = ySize / 2 - HALF_GRABBER_SIZE;
        return { x, y };
    }

    computeBottomGrabberPosition(xSize: number, ySize: number): Vec2 {
        const x = xSize / 2 - HALF_GRABBER_SIZE;
        const y = ySize + GRABBER_OFFSET_Y;
        return { x, y };
    }

    computeCornerGrabberPosition(xSize: number, ySize: number): Vec2 {
        const x = xSize - GRABBER_OFFSET;
        const y = ySize - GRABBER_OFFSET;
        return { x, y };
    }

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.clientX, y: event.clientY };
    }

    onGrabberClick(event: MouseEvent): void {
        this.clickedGrabber = (event.target as HTMLElement).id;
        if (this.clickedGrabber === 'bottom-grabber' || this.clickedGrabber === 'right-grabber' || this.clickedGrabber === 'corner-grabber') {
            this.mouseDown = event.button === MouseButton.Left;
            if (this.mouseDown) {
                this.mouseDownCoord = this.getPositionFromMouse(event);
            }
        }
    }

    onGrabberMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.grabberMoveEmitter.emit({ offset: this.computeOffset(event), grabber: this.clickedGrabber });
        }
    }

    onGrabberUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.grabberMoveEmitter.emit({ offset: this.computeOffset(event), grabber: this.clickedGrabber });
        }
        this.mouseDown = false;
    }

    computeOffset(event: MouseEvent): Vec2 {
        const currentOffset: Vec2 = {
            x: this.getPositionFromMouse(event).x,
            y: this.getPositionFromMouse(event).y,
        };
        return currentOffset;
    }
}
