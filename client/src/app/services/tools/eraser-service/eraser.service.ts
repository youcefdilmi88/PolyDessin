import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const WIDTH = 5;

@Injectable({
    providedIn: 'root',
})
export class EraserService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Eraser;
    currentLineWidth: number = WIDTH;
    private pathData: Vec2[] = [];

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'none';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawImageEraser(this.drawingService.previewCtx, this.mouseDownCoord);
            this.drawEraserLine(this.drawingService.baseCtx, this.mouseDownCoord, this.pathData);
            this.pathData.push(this.mouseDownCoord);
        }
        this.clearPath();
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'none';
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'none';
        const mousePosition = this.getPositionFromMouse(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawImageEraser(this.drawingService.previewCtx, mousePosition);
        if (this.mouseDown) {
            this.drawEraserLine(this.drawingService.baseCtx, this.mouseDownCoord, this.pathData);
            this.pathData.push(mousePosition);
        }
    }

    private drawImageEraser(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.fillRect(
            mousePosition.x - this.currentLineWidth / 2,
            mousePosition.y - this.currentLineWidth / 2,
            this.currentLineWidth,
            this.currentLineWidth,
        );
        ctx.strokeStyle = 'black';
        ctx.strokeRect(
            mousePosition.x - this.currentLineWidth / 2,
            mousePosition.y - this.currentLineWidth / 2,
            this.currentLineWidth,
            this.currentLineWidth,
        );
        ctx.restore();
    }

    private drawEraserLine(ctx: CanvasRenderingContext2D, mousePosition: Vec2, path: Vec2[]): void {
        ctx.save();
        ctx.beginPath();
        if (this.mouseDown) {
            ctx.fillStyle = 'white';
            ctx.fillRect(
                mousePosition.x - this.currentLineWidth / 2,
                mousePosition.y - this.currentLineWidth / 2,
                this.currentLineWidth,
                this.currentLineWidth,
            );
        }
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.currentLineWidth;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.lineCap = 'square';
            ctx.fillStyle = 'white';
            ctx.fillRect(
                mousePosition.x - this.currentLineWidth / 2,
                mousePosition.y - this.currentLineWidth / 2,
                this.currentLineWidth,
                this.currentLineWidth,
            );
            ctx.lineJoin = 'round';
        }
        ctx.stroke();
        ctx.restore();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
