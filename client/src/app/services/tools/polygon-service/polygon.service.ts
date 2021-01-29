import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ShapeBehavior } from '@enums/shape-behavior';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const ROTATION_CALCULATION_MULTIPLIER = 3;
@Injectable({
    providedIn: 'root',
})
export class PolygonService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Polygon;
    currentBehavior: string = ShapeBehavior.ContourSeulement;
    currentSidesNumber: number = 3;
    mousePosition: Vec2 = { x: 0, y: 0 };

    setCurrentSideNumber(sides: number): void {
        this.currentSidesNumber = sides;
    }

    setCurrentBehavior(behavior: string): void {
        this.currentBehavior = behavior;
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
            this.drawPolygon(this.drawingService.baseCtx, this.mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawPolygon(this.drawingService.previewCtx, this.mousePosition);
        }
    }

    drawPolygon(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        const variationX = this.mousePosition.x - this.mouseDownCoord.x;
        const variationY = this.mousePosition.y - this.mouseDownCoord.y;
        const numberOfSides = Number(this.currentSidesNumber);
        const size = Math.abs(variationX) < Math.abs(variationY) ? variationY : variationX;
        const xCenter = this.mouseDownCoord.x;
        const yCenter = this.mouseDownCoord.y;
        const rotation = (ROTATION_CALCULATION_MULTIPLIER / 2) * Math.PI;

        ctx.beginPath();
        ctx.moveTo(xCenter + size * Math.cos(0 + rotation), yCenter + size * Math.sin(0 + rotation));

        for (let i = 1; i <= numberOfSides; i += 1) {
            ctx.lineTo(
                xCenter + size * Math.cos((i * 2 * Math.PI) / numberOfSides + rotation),
                yCenter + size * Math.sin((i * 2 * Math.PI) / numberOfSides + rotation),
            );
        }

        if (this.currentBehavior !== ShapeBehavior.PleinSansContour) {
            ctx.strokeStyle = this.currentSecondaryColor;
            ctx.lineWidth = this.currentLineWidth;
            ctx.stroke();
        }

        if (this.currentBehavior !== ShapeBehavior.ContourSeulement) {
            ctx.fillStyle = this.currentPrimaryColor;
            ctx.fill();
        }
    }
}
