import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MagnetAnchor } from '@enums/magnet-anchor';
import { MouseButton } from '@enums/mouse-button';
import { DrawingService } from '@services/drawing/drawing.service';
import { BehaviorSubject } from 'rxjs';

const ANGLE_180 = 180;
const ANGLE_360 = 360;
const ANGLE_15 = 15;
const DEFAULT_GRID = 20;
const MOVEMENT_ARROW = 3;
@Injectable({
    providedIn: 'root',
})
export class SelectionService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    currentLineWidth: number = 1;
    shiftPressed: boolean = false;
    selectionData: HTMLCanvasElement;
    clipboard: HTMLCanvasElement;
    selectionWidth: number;
    selectionHeight: number;
    selectionMiddle: Vec2 = { x: 0, y: 0 };
    newPoint: Vec2 = { x: 0, y: 0 };
    mousePosition: Vec2;
    selectionMouseDown: Vec2 = { x: 0, y: 0 };
    currentSelectionAngle: number = 0;
    selectionAngle: BehaviorSubject<number> = new BehaviorSubject(this.currentSelectionAngle);
    currentGridSquareSize: number = DEFAULT_GRID;
    currentMagnetAnchor: MagnetAnchor = MagnetAnchor.TopLeft;
    isMagnetismOn: boolean = false;
    protected radianEllipse: Vec2 = { x: 0, y: 0 };
    protected width: number;
    protected height: number;
    private isDragged: boolean;
    private isDraggable: boolean = false;
    private delta: Vec2 = { x: 0, y: 0 };
    private pointRadius: number = 3;
    private mouseUpPosition: Vec2;
    private topCenterControl: Vec2 = { x: 0, y: 0 };
    private topLeftControl: Vec2 = { x: 0, y: 0 };
    private topRightControl: Vec2 = { x: 0, y: 0 };
    private bottomCenterControl: Vec2 = { x: 0, y: 0 };
    private bottomLeftControl: Vec2 = { x: 0, y: 0 };
    private bottomRightControl: Vec2 = { x: 0, y: 0 };
    private leftCenterControl: Vec2 = { x: 0, y: 0 };
    private rightCenterControl: Vec2 = { x: 0, y: 0 };

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.checkIsDraggable(event);
            if (this.isDraggable) {
                this.selectionMouseDown = this.getPositionFromMouse(event);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.isDragged = true;
            } else {
                this.currentSelectionAngle = 0;
                this.mouseDownCoord = this.getPositionFromMouse(event);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.isDragged = false;
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseUpPosition = this.getPositionFromMouse(event);
        if (this.mouseDown && this.isDragged) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelection(this.drawingService.baseCtx, this.mouseUpPosition);
            this.drawBox(this.drawingService.previewCtx, this.mouseUpPosition);
            this.saveSelection();
            const deltaX = this.mouseUpPosition.x - this.selectionMouseDown.x;
            const deltaY = this.mouseUpPosition.y - this.selectionMouseDown.y;
            this.newPoint.x =
                this.mouseDownCoord.x + deltaX > this.mouseUpPosition.x + deltaX ? this.mouseUpPosition.x + deltaX : this.mouseDownCoord.x + deltaX;
            this.newPoint.y =
                this.mouseDownCoord.y + deltaY > this.mouseUpPosition.y + deltaY ? this.mouseUpPosition.y + deltaY : this.mouseDownCoord.y + deltaY;
        } else if (this.mouseDown && !this.isDraggable) {
            this.newPoint.x = this.mouseDownCoord.x > this.mouseUpPosition.x ? this.mouseUpPosition.x : this.mouseDownCoord.x;
            this.newPoint.y = this.mouseDownCoord.y > this.mouseUpPosition.y ? this.mouseUpPosition.y : this.mouseDownCoord.y;
            this.selectionWidth = Math.abs(this.mouseUpPosition.x - this.mouseDownCoord.x);
            this.selectionHeight = Math.abs(this.mouseUpPosition.y - this.mouseDownCoord.y);
            this.drawPreview(this.drawingService.previewCtx, event);
            this.drawBox(this.drawingService.previewCtx, this.mouseUpPosition);
        }
        this.mouseDown = false;
        this.selectionMiddle.x = this.newPoint.x + this.selectionWidth / 2;
        this.selectionMiddle.y = this.newPoint.y + this.selectionHeight / 2;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mousePosition = this.getPositionFromMouse(event);
        if (this.mouseDown && this.isDraggable) {
            this.delta.x = this.mousePosition.x - this.mouseDownCoord.x;
            this.delta.y = this.mousePosition.y - this.mouseDownCoord.y;
            this.drawingService.previewCtx.canvas.style.cursor = 'pointer';
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.clearSelection(this.drawingService.baseCtx);
            this.drawSelection(this.drawingService.previewCtx, this.mousePosition);
            this.isDragged = true;
        } else if (this.mouseDown && !this.isDraggable) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPreview(this.drawingService.previewCtx, event);
            this.isDragged = false;
        }
    }

    // Ceci est justifié vu que les méthodes seront implémentées dans les classes enfant
    // tslint:disable:no-empty
    drawSelection(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {}
    drawPreview(ctx: CanvasRenderingContext2D, event: MouseEvent): void {}
    clearSelection(ctx: CanvasRenderingContext2D): void {}

    drawBox(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.setLineDash([0]);
        ctx.strokeStyle = '#4088DA';
        ctx.lineWidth = 2;
        let topLeftX = this.newPoint.x + mousePosition.x - this.selectionMouseDown.x;
        let topLeftY = this.newPoint.y + mousePosition.y - this.selectionMouseDown.y;
        let computedTopLeft: Vec2;
        if (this.isDragged && this.isMagnetismOn) {
            topLeftX = Math.round(topLeftX / this.currentGridSquareSize) * this.currentGridSquareSize;
            topLeftY = Math.round(topLeftY / this.currentGridSquareSize) * this.currentGridSquareSize;
            computedTopLeft = this.computeMagnetTopCorner({ x: topLeftX, y: topLeftY });
            ctx.strokeRect(
                computedTopLeft.x + this.currentGridSquareSize,
                computedTopLeft.y + this.currentGridSquareSize,
                this.selectionWidth,
                this.selectionHeight,
            );
        } else {
            if (this.isDragged) {
                ctx.strokeRect(topLeftX, topLeftY, this.selectionWidth, this.selectionHeight);
                this.drawPoint(ctx, mousePosition);
            } else {
                ctx.strokeRect(this.newPoint.x, this.newPoint.y, this.selectionWidth, this.selectionHeight);
                this.drawPoint(ctx, mousePosition);
            }
        }
    }

    private checkIsDraggable(event: MouseEvent): void {
        const deltaX = this.mouseUpPosition.x - this.selectionMouseDown.x;
        const deltaY = this.mouseUpPosition.y - this.selectionMouseDown.y;
        if (this.isDragged) {
            if (this.selectionData !== undefined) {
                this.isDraggable =
                    event.offsetX < this.newPoint.x + this.selectionWidth + deltaX &&
                    event.offsetX >= this.newPoint.x + deltaX &&
                    event.offsetY < this.newPoint.y + this.selectionHeight + deltaY &&
                    event.offsetY >= this.newPoint.y + deltaY;
            } else {
                this.isDraggable = false;
            }
        } else {
            if (this.selectionData !== undefined) {
                this.isDraggable =
                    event.offsetX < this.newPoint.x + this.selectionWidth &&
                    event.offsetX >= this.newPoint.x &&
                    event.offsetY < this.newPoint.y + this.selectionHeight &&
                    event.offsetY >= this.newPoint.y;
            } else {
                this.isDraggable = false;
            }
        }
    }

    saveSelection(): void {
        const temp = document.createElement('canvas') as HTMLCanvasElement;
        temp.width = this.drawingService.baseCanvas.width;
        temp.height = this.drawingService.baseCanvas.height;
        const destCtx = temp.getContext('2d') as CanvasRenderingContext2D;
        destCtx.drawImage(this.drawingService.baseCanvas, 0, 0);
        this.selectionData = temp;
    }

    onMouseWheel(event: WheelEvent): void {
        this.selectionMouseDown = { x: this.selectionMiddle.x, y: this.selectionMiddle.y };
        const y = event.deltaY;
        if (y < 0) {
            // wheel up
            if (event.altKey) {
                this.currentSelectionAngle += 1;
            } else {
                this.currentSelectionAngle += ANGLE_15;
            }
        } else if (event.deltaY > 0) {
            // wheel down
            if (event.altKey) {
                this.currentSelectionAngle -= 1;
            } else {
                this.currentSelectionAngle -= ANGLE_15;
            }
        }
        const OFFSET = this.currentSelectionAngle > ANGLE_180 ? -ANGLE_360 : this.currentSelectionAngle < -ANGLE_180 ? ANGLE_360 : 0;
        this.currentSelectionAngle += OFFSET;
        this.selectionAngle.next(this.currentSelectionAngle);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.clearSelection(this.drawingService.previewCtx);
        this.drawSelection(this.drawingService.previewCtx, { x: this.selectionMiddle.x, y: this.selectionMiddle.y });
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
    }

    computeMagnetTopCorner(selectionTopCorner: Vec2): Vec2 {
        switch (this.currentMagnetAnchor) {
            case MagnetAnchor.TopLeft:
                return selectionTopCorner;
            case MagnetAnchor.TopCenter:
                return { x: selectionTopCorner.x - this.selectionWidth / 2, y: selectionTopCorner.y };
            case MagnetAnchor.TopRight:
                return { x: selectionTopCorner.x - this.selectionWidth, y: selectionTopCorner.y };
            case MagnetAnchor.CenterLeft:
                return { x: selectionTopCorner.x, y: selectionTopCorner.y - this.selectionHeight / 2 };
            case MagnetAnchor.CenterCenter:
                return { x: selectionTopCorner.x - this.selectionWidth / 2, y: selectionTopCorner.y - this.selectionHeight / 2 };
            case MagnetAnchor.CenterRight:
                return { x: selectionTopCorner.x - this.selectionWidth, y: selectionTopCorner.y - this.selectionHeight / 2 };
            case MagnetAnchor.BottomLeft:
                return { x: selectionTopCorner.x, y: selectionTopCorner.y - this.selectionHeight };
            case MagnetAnchor.BottomCenter:
                return { x: selectionTopCorner.x - this.selectionWidth / 2, y: selectionTopCorner.y - this.selectionHeight };
            case MagnetAnchor.BottomRight:
                return { x: selectionTopCorner.x - this.selectionWidth, y: selectionTopCorner.y - this.selectionHeight };
            default:
                return { x: 0, y: 0 };
        }
    }

    onKeyPress(event: KeyboardEvent): void {
        this.selectionMouseDown = { x: this.selectionMiddle.x, y: this.selectionMiddle.y };
        if (event.key === 'Escape') {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.mouseDown = false;
            this.isDraggable = false;
        }
        if (event.key === 'm') {
            if (!this.isMagnetismOn) {
                this.isMagnetismOn = true;
            } else {
                this.isMagnetismOn = false;
            }
        }
        if (event.key === 'ArrowRight') {
            this.delta.x += MOVEMENT_ARROW;
            this.clearSelection(this.drawingService.baseCtx);
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelection(this.drawingService.previewCtx, {
                x: this.selectionMiddle.x + this.delta.x,
                y: this.selectionMiddle.y + this.delta.y,
            });
        }
        if (event.key === 'ArrowLeft') {
            this.delta.x -= MOVEMENT_ARROW;
            this.clearSelection(this.drawingService.baseCtx);
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelection(this.drawingService.previewCtx, {
                x: this.selectionMiddle.x + this.delta.x,
                y: this.selectionMiddle.y + this.delta.y,
            });
        }
        if (event.key === 'ArrowUp') {
            this.delta.y -= MOVEMENT_ARROW;
            this.clearSelection(this.drawingService.baseCtx);
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelection(this.drawingService.previewCtx, {
                x: this.selectionMiddle.x + this.delta.x,
                y: this.selectionMiddle.y + this.delta.y,
            });
        }
        if (event.key === 'ArrowDown') {
            this.delta.y += MOVEMENT_ARROW;
            this.clearSelection(this.drawingService.baseCtx);
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawSelection(this.drawingService.previewCtx, {
                x: this.selectionMiddle.x + this.delta.x,
                y: this.selectionMiddle.y + this.delta.y,
            });
        }
    }

    private drawPoint(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        const xMiddle = this.newPoint.x + this.selectionWidth / 2;
        const yMiddle = this.newPoint.y + this.selectionHeight / 2;
        const deltaX = mousePosition.x - this.selectionMouseDown.x;
        const deltaY = mousePosition.y - this.selectionMouseDown.y;
        if (this.isDragged) {
            this.bottomRightControl = {
                x: this.newPoint.x + this.selectionWidth + deltaX,
                y: this.newPoint.y + this.selectionHeight + deltaY,
            };
            this.bottomCenterControl = { x: xMiddle + deltaX, y: this.newPoint.y + this.selectionHeight + deltaY };
            this.bottomLeftControl = { x: this.newPoint.x + deltaX, y: this.newPoint.y + this.selectionHeight + deltaY };
            this.leftCenterControl = { x: this.newPoint.x + deltaX, y: yMiddle + deltaY };
            this.topLeftControl = { x: this.newPoint.x + deltaX, y: this.newPoint.y + deltaY };
            this.topCenterControl = { x: xMiddle + deltaX, y: this.newPoint.y + deltaY };
            this.topRightControl = { x: this.newPoint.x + this.selectionWidth + deltaX, y: this.newPoint.y + deltaY };
            this.rightCenterControl = { x: this.newPoint.x + this.selectionWidth + deltaX, y: yMiddle + deltaY };
        } else {
            this.bottomRightControl = { x: this.newPoint.x + this.selectionWidth, y: this.newPoint.y + this.selectionHeight };
            this.bottomCenterControl = { x: xMiddle, y: this.newPoint.y + this.selectionHeight };
            this.bottomLeftControl = { x: this.newPoint.x, y: this.newPoint.y + this.selectionHeight };
            this.leftCenterControl = { x: this.newPoint.x, y: yMiddle };
            this.topLeftControl = this.newPoint;
            this.topCenterControl = { x: xMiddle, y: this.newPoint.y };
            this.topRightControl = { x: this.newPoint.x + this.selectionWidth, y: this.newPoint.y };
            this.rightCenterControl = { x: this.newPoint.x + this.selectionWidth, y: yMiddle };
        }

        ctx.fillStyle = 'black';
        this.line(ctx, this.bottomRightControl.x, this.bottomRightControl.y);
        this.line(ctx, this.bottomLeftControl.x, this.bottomLeftControl.y);
        this.line(ctx, this.bottomCenterControl.x, this.bottomCenterControl.y);
        this.line(ctx, this.leftCenterControl.x, this.leftCenterControl.y);
        this.line(ctx, this.rightCenterControl.x, this.rightCenterControl.y);
        this.line(ctx, this.topCenterControl.x, this.topCenterControl.y);
        this.line(ctx, this.topLeftControl.x, this.topLeftControl.y);
        this.line(ctx, this.topRightControl.x, this.topRightControl.y);
    }

    private line(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        ctx.beginPath();
        ctx.arc(x, y, this.pointRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}
