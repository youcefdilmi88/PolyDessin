import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const ONE_SECOND_IN_MILLI = 1000;
@Injectable({
    providedIn: 'root',
})
export class SprayService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Spray;
    currentSprayDiameter: number = 5;
    currentInterval: number = 10;
    currentDotDiameter: number = 1;
    private timer: number;
    private newPointX: number;
    private newPointY: number;
    private pathData: Vec2[] = [];

    setSprayDiameter(diameter: number): void {
        this.currentSprayDiameter = diameter;
    }

    setEmissionInterval(interval: number): void {
        this.currentInterval = interval;
    }

    setDotDiameter(diameter: number): void {
        this.currentDotDiameter = diameter;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.firstSpray(this.drawingService.baseCtx);
            this.drawSpray(this.drawingService.baseCtx);
            this.pathData.push(this.mouseDownCoord);
        }
        this.drawingService.addInEditStack();
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(this.mousePosition);
        }
        window.clearInterval(this.timer);
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    private getRandomOffset(radius: number): Vec2 {
        const randomAngle = Math.random() * (2 * Math.PI);
        const randomRadius = Math.random() * radius;
        return { x: Math.cos(randomAngle) * randomRadius, y: Math.sin(randomAngle) * randomRadius };
    }

    private drawSpray(ctx: CanvasRenderingContext2D): void {
        // To escape nodeJS setInterval:nodeJS.timer
        this.timer = window.setInterval(() => {
            this.drawPoint(ctx);
        }, ONE_SECOND_IN_MILLI / this.currentInterval);
    }

    private drawPoint(ctx: CanvasRenderingContext2D): void {
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        ctx.fillStyle = this.currentPrimaryColor;
        ctx.globalAlpha = this.currentPrimaryAlpha;
        const offset = this.getRandomOffset(this.currentSprayDiameter);
        this.newPointX = this.mouseDownCoord.x + offset.x;
        this.newPointY = this.mouseDownCoord.y + offset.y;
        ctx.beginPath();
        ctx.arc(this.newPointX, this.newPointY, this.currentDotDiameter / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    private firstSpray(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.currentInterval / 2; i++) {
            this.drawPoint(ctx);
        }
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
