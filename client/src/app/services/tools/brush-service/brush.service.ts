import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const STROKE_OFFSET1 = 5;
const STROKE_OFFSET2 = 0.5;
const SHADOWBLUR = 5;
const GLOBAL_ALPHA = 0.0059;
@Injectable({
    providedIn: 'root',
})
export class BrushService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Brush;
    currentTexture: string;
    private pathData: Vec2[] = [];

    setCurrentTexture(texture: string): void {
        this.currentTexture = texture;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
        this.drawingService.addInEditStack();
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(this.mousePosition);
            this.drawBrushLine(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(this.mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawBrushLine(this.drawingService.previewCtx, this.pathData);
        }
    }

    private drawBrushLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        switch (this.currentTexture) {
            case 'Texture 1':
                this.drawBrushLine1(ctx, path);
                break;
            case 'Texture 2':
                this.drawBrushLine2(ctx, path);
                break;
            case 'Texture 3':
                this.drawBrushLine3(ctx, path);
                break;
            case 'Texture 4':
                this.drawBrushLine4(ctx, path);
                break;
            case 'Texture 5':
                this.drawBrushLine5(ctx, path);
                break;
            default:
                this.drawBrushLine1(ctx, path);
                break;
        }
    }

    private drawBrushLine1(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentPrimaryColor;
            ctx.shadowColor = this.currentPrimaryColor;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = SHADOWBLUR;
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.globalAlpha = this.currentPrimaryAlpha;
        }
        ctx.stroke();
    }

    private drawBrushLine2(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentPrimaryColor;
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineJoin = 'bevel';
            ctx.lineCap = 'square';
            ctx.globalAlpha = this.currentPrimaryAlpha;
            ctx.shadowBlur = 0;
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.moveTo(point.x - STROKE_OFFSET1, point.y - STROKE_OFFSET1);
            ctx.lineTo(point.x - STROKE_OFFSET1, point.y - STROKE_OFFSET1);
            ctx.stroke();
        }
        ctx.stroke();
    }

    private drawBrushLine3(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentPrimaryColor;
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'square';
            ctx.globalAlpha = this.currentPrimaryAlpha;
            ctx.shadowBlur = 0;
            ctx.moveTo(point.x - STROKE_OFFSET2, point.y - STROKE_OFFSET2);
            ctx.lineTo(point.x - STROKE_OFFSET2, point.y - STROKE_OFFSET2);
            ctx.stroke();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.moveTo(point.x + STROKE_OFFSET2, point.y + STROKE_OFFSET2);
            ctx.lineTo(point.x + STROKE_OFFSET2, point.y + STROKE_OFFSET2);
            ctx.stroke();
        }
        ctx.stroke();
    }

    private drawBrushLine4(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentPrimaryColor;
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineJoin = 'bevel';
            ctx.lineCap = 'round';
            ctx.globalAlpha = GLOBAL_ALPHA;
            ctx.shadowBlur = 0;
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
        ctx.stroke();
    }

    private drawBrushLine5(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.beginPath();
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentPrimaryColor;
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineJoin = 'bevel';
            ctx.lineCap = 'butt';
            ctx.globalAlpha = this.currentPrimaryAlpha;
            ctx.shadowBlur = 0;
            ctx.moveTo(point.x - 2, point.y - 2);
            ctx.lineTo(point.x - 2, point.y - 2);
            ctx.stroke();
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
