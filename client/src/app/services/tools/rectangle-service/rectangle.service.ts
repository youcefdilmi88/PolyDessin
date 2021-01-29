import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ShapeBehavior } from '@enums/shape-behavior';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const START_COORD_INNER_OFFSET = -1;
const END_COORD_INNER_OFFSET = -2;
const NEGATIVE = -1;
@Injectable({
    providedIn: 'root',
})
export class RectangleService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Rectangle;
    private currentBehavior: ShapeBehavior = ShapeBehavior.ContourSeulement;
    squareEnabled: boolean = false;

    setCurrentBehavior(behavior: string): void {
        const currentBehavior = Object.keys(ShapeBehavior).find((key) => ShapeBehavior[key as keyof typeof ShapeBehavior] === behavior);
        const behaviorEnumValue: ShapeBehavior = ShapeBehavior[currentBehavior as keyof typeof ShapeBehavior];
        this.currentBehavior = behaviorEnumValue;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
        this.drawingService.addInEditStack();
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.drawRectangle(this.drawingService.baseCtx, this.mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.mousePosition);
        }
    }

    drawRectangle(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        switch (this.currentBehavior) {
            case ShapeBehavior.ContourSeulement:
                this.drawContour(ctx, mousePosition);
                break;

            case ShapeBehavior.PleinAvecContour:
                this.drawShapeContour(ctx, mousePosition);
                break;

            case ShapeBehavior.PleinSansContour:
                this.drawShape(ctx, mousePosition);
                break;

            default:
                break;
        }
    }

    computeWidth(mousePosition: Vec2): number {
        if (this.squareEnabled) {
            return Math.abs(mousePosition.x - this.mouseDownCoord.x) * (mousePosition.x < this.mouseDownCoord.x ? NEGATIVE : 1);
        } else {
            return mousePosition.x - this.mouseDownCoord.x;
        }
    }

    computeHeight(mousePosition: Vec2): number {
        if (this.squareEnabled) {
            const width = Math.abs(mousePosition.x - this.mouseDownCoord.x) * (mousePosition.x < this.mouseDownCoord.x ? NEGATIVE : 1);
            return Math.abs(width) * (mousePosition.y < this.mouseDownCoord.y ? NEGATIVE : 1);
        } else {
            return mousePosition.y - this.mouseDownCoord.y;
        }
    }

    private drawShape(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.save();
        ctx.fillStyle = this.currentPrimaryColor;
        ctx.fillRect(this.mouseDownCoord.x, this.mouseDownCoord.y, this.computeWidth(mousePosition), this.computeHeight(mousePosition));
        ctx.restore();
    }

    private drawContour(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.save();
        ctx.lineJoin = 'miter';
        ctx.lineWidth = this.currentLineWidth;
        ctx.strokeStyle = this.currentSecondaryColor;
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, this.computeWidth(mousePosition), this.computeHeight(mousePosition));
        ctx.restore();
    }

    private computeStartCoord(mousePosition: Vec2): Vec2 {
        let startCoordX;
        if (this.mouseDownCoord.x < mousePosition.x) {
            startCoordX = this.mouseDownCoord.x + this.currentLineWidth / 2;
            startCoordX += this.currentLineWidth % 2 ? START_COORD_INNER_OFFSET : 0;
        } else {
            startCoordX = this.mouseDownCoord.x - this.currentLineWidth / 2;
            startCoordX += this.currentLineWidth % 2 ? 1 : 0;
        }
        let startCoordY;
        if (this.mouseDownCoord.y < mousePosition.y) {
            startCoordY = this.mouseDownCoord.y + this.currentLineWidth / 2;
            startCoordY += this.currentLineWidth % 2 ? START_COORD_INNER_OFFSET : 0;
        } else {
            startCoordY = this.mouseDownCoord.y - this.currentLineWidth / 2;
            startCoordY += this.currentLineWidth % 2 ? 1 : 0;
        }
        return { x: startCoordX, y: startCoordY };
    }

    private computeEndCoord(mousePosition: Vec2): Vec2 {
        let endCoordX;
        if (this.mouseDownCoord.x < mousePosition.x) {
            endCoordX = mousePosition.x - this.mouseDownCoord.x - this.currentLineWidth;
            endCoordX += this.currentLineWidth % 2 ? 2 : 0;
        } else {
            endCoordX = mousePosition.x - this.mouseDownCoord.x + this.currentLineWidth;
            endCoordX += this.currentLineWidth % 2 ? END_COORD_INNER_OFFSET : 0;
        }
        let endCoordY;
        if (this.mouseDownCoord.y < mousePosition.y) {
            endCoordY = mousePosition.y - this.mouseDownCoord.y - this.currentLineWidth;
            endCoordY += this.currentLineWidth % 2 ? 2 : 0;
        } else {
            endCoordY = mousePosition.y - this.mouseDownCoord.y + this.currentLineWidth;
            endCoordY += this.currentLineWidth % 2 ? END_COORD_INNER_OFFSET : 0;
        }
        return { x: endCoordX, y: endCoordY };
    }

    private computeEndCoordSquare(mousePosition: Vec2): Vec2 {
        let endCoordX;
        if (this.mouseDownCoord.x < mousePosition.x) {
            endCoordX = this.computeWidth(mousePosition) - this.currentLineWidth;
            endCoordX += this.currentLineWidth % 2 ? 2 : 0;
        } else {
            endCoordX = this.computeWidth(mousePosition) + this.currentLineWidth;
            endCoordX += this.currentLineWidth % 2 ? END_COORD_INNER_OFFSET : 0;
        }
        let endCoordY;
        if (this.mouseDownCoord.y < mousePosition.y) {
            endCoordY = this.computeHeight(mousePosition) - this.currentLineWidth;
            endCoordY += this.currentLineWidth % 2 ? 2 : 0;
        } else {
            endCoordY = this.computeHeight(mousePosition) + this.currentLineWidth;
            endCoordY += this.currentLineWidth % 2 ? END_COORD_INNER_OFFSET : 0;
        }
        return { x: endCoordX, y: endCoordY };
    }

    private drawShapeContour(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.save();
        ctx.lineJoin = 'miter';
        ctx.lineWidth = this.currentLineWidth;
        ctx.strokeStyle = this.currentSecondaryColor;
        ctx.fillStyle = this.currentPrimaryColor;
        if (this.squareEnabled) {
            ctx.fillRect(
                this.computeStartCoord(mousePosition).x,
                this.computeStartCoord(mousePosition).y,
                this.computeEndCoordSquare(mousePosition).x,
                this.computeEndCoordSquare(mousePosition).y,
            );
        } else {
            ctx.fillRect(
                this.computeStartCoord(mousePosition).x,
                this.computeStartCoord(mousePosition).y,
                this.computeEndCoord(mousePosition).x,
                this.computeEndCoord(mousePosition).y,
            );
        }
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, this.computeWidth(mousePosition), this.computeHeight(mousePosition));
        ctx.restore();
    }

    drawOnSquareToggle(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawRectangle(this.drawingService.previewCtx, this.mousePosition);
    }
}
