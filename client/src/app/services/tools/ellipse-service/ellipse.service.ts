import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const END_ANGLE = 7;
@Injectable({
    providedIn: 'root',
})
export class EllipseService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Ellipse;
    private currentBehavior: string = 'Contour seulement';
    private radianX: number;
    private radianY: number;

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
            const mousePosition = this.getPositionFromMouse(event);
            this.drawEllipse(this.drawingService.baseCtx, mousePosition, event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, mousePosition, event);
        }
    }

    private drawEllipse(ctx: CanvasRenderingContext2D, mousePosition: Vec2, event: MouseEvent): void {
        this.radianX = Math.abs(
            mousePosition.x - this.mouseDownCoord.x - (this.mouseDownCoord.x < mousePosition.x ? this.currentLineWidth : -this.currentLineWidth),
        );
        this.radianY = Math.abs(
            mousePosition.y - this.mouseDownCoord.y - (this.mouseDownCoord.y < mousePosition.y ? this.currentLineWidth : -this.currentLineWidth),
        );
        if (event.shiftKey) this.radianY = this.radianX;

        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.fillStyle = this.currentPrimaryColor;

        ctx.ellipse(this.mouseDownCoord.x, this.mouseDownCoord.y, this.radianX, this.radianY, 0, 0, END_ANGLE);
        if (this.currentBehavior !== 'Plein sans contour') {
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentSecondaryColor;
            ctx.globalAlpha = this.currentSecondaryAlpha;
            ctx.stroke();
        }
        if (this.currentBehavior !== 'Contour seulement') {
            ctx.globalAlpha = this.currentPrimaryAlpha;
            ctx.fill();
        }
    }
}
