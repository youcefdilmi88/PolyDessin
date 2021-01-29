import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';
import { BehaviorSubject } from 'rxjs';

const ANGLE_180 = 180;
const ANGLE_360 = 360;
const ANGLE_15 = 15;

@Injectable({
    providedIn: 'root',
})
export class FeatherService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Feather;
    angle: BehaviorSubject<number> = new BehaviorSubject(this.currentFeatherAngle);
    private pathData: Vec2[] = [];
    private tabAngle: number[] = [];

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.tabAngle.push(this.currentFeatherAngle);
        }
        this.drawingService.addInEditStack();
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.drawFeatherLine(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
        this.clearPath();
        this.clearTabAngle();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(this.mousePosition);
            this.tabAngle.push(this.currentFeatherAngle);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawFeatherLine(this.drawingService.previewCtx);
        }
    }

    onMouseWheel(event: WheelEvent): void {
        const y = event.deltaY;
        if (y < 0) {
            // scroll up
            if (event.altKey) {
                this.currentFeatherAngle += 1;
            } else {
                this.currentFeatherAngle += ANGLE_15;
            }
        } else if (y > 0) {
            // scroll down
            if (event.altKey) {
                this.currentFeatherAngle -= 1;
            } else {
                this.currentFeatherAngle -= ANGLE_15;
            }
        }
        const OFFSET = this.currentFeatherAngle > ANGLE_180 ? -ANGLE_360 : this.currentFeatherAngle < -ANGLE_180 ? ANGLE_360 : 0;
        this.currentFeatherAngle += OFFSET;
        this.angle.next(this.currentFeatherAngle);
    }

    private drawFeatherLine(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'butt';
        ctx.strokeStyle = this.currentPrimaryColor;
        ctx.globalAlpha = this.currentPrimaryAlpha;
        for (let i = 0; i < this.currentFeatherLineHeight; ++i) {
            // Lineheight correspond au nombre de points du array pathdata
            ctx.moveTo(
                this.mouseDownCoord.x + i * Math.cos((Math.PI * this.tabAngle[i]) / ANGLE_180),
                this.mouseDownCoord.y + i * -Math.sin((Math.PI * this.tabAngle[i]) / ANGLE_180),
            );
            for (let j = 0; j < this.pathData.length; j++) {
                ctx.lineTo(
                    this.pathData[j].x + i * Math.cos((Math.PI * this.tabAngle[j]) / ANGLE_180),
                    this.pathData[j].y + i * -Math.sin((Math.PI * this.tabAngle[j]) / ANGLE_180),
                );
            }
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }

    private clearTabAngle(): void {
        this.tabAngle = [];
    }
}
