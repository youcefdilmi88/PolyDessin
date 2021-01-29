import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const THREE_DIGIT = 3;
const FOUR_DIGIT = 4;
const FIVE_DIGIT = 5;
const SEVEN_DIGIT = 7;
const EIGHT_DIGIT = 8;
const SIGN = -1;
const ANGLE_22 = Math.PI / EIGHT_DIGIT; // 22.5
const ANGLE_45 = Math.PI / FOUR_DIGIT;
const ANGLE_67 = (Math.PI * THREE_DIGIT) / EIGHT_DIGIT; // 67.5
const ANGLE_112 = (Math.PI * FIVE_DIGIT) / EIGHT_DIGIT; // 112.5
const ANGLE_135 = (Math.PI * THREE_DIGIT) / FOUR_DIGIT; // 135
const ANGLE_157 = (Math.PI * SEVEN_DIGIT) / EIGHT_DIGIT; // 157.5
const JUNCTION = 3;
const PIXEL_LENGTH = 20;

@Injectable({
    providedIn: 'root',
})
export class LineService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Line;
    align: boolean = false;
    doubleClick: boolean = false;
    withPoint: boolean = true;
    keyEscape: boolean = false;
    keyBackspace: boolean = false;

    private pathData: Vec2[] = [];
    private alignement: Vec2;

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.doubleClick = false;
        this.mouseDown = event.button === MouseButton.Left;
        this.mouseDown = true;
        if (this.mouseDown && !this.align) {
            this.keyEscape = false;
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
        this.drawingService.addInEditStack();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawStraightLines(this.drawingService.previewCtx);
            if (!this.keyEscape) {
                this.drawStraightLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.mousePosition);
            }
        }
    }

    // Pour les jonctions
    private drawPoint(ctx: CanvasRenderingContext2D, center: Vec2): void {
        ctx.beginPath();
        ctx.arc(center.x, center.y, this.currentRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }

    drawStraightLine(ctx: CanvasRenderingContext2D, start: Vec2, end: Vec2): void {
        if (start && end) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineWidth = this.currentLineWidth;
            ctx.strokeStyle = this.currentPrimaryColor;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = this.currentPrimaryAlpha;
            ctx.stroke();
        }
    }

    private drawStraightLines(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this.pathData.length - 1; i++) {
            this.drawStraightLine(ctx, this.pathData[i], this.pathData[i + 1]);
            if (this.withPoint) {
                if (i === this.pathData.length - JUNCTION && this.doubleClick) break;
                this.drawPoint(ctx, this.pathData[i + 1]);
            }
        }
    }

    onDoubleClick(event: MouseEvent): void {
        // Ignore le premier click du double click
        const lastPoint = this.pathData.pop() as Vec2;
        this.doubleClick = true;

        if (this.distanceTwoPoints(lastPoint, this.pathData[this.pathData.length - 2]) <= PIXEL_LENGTH) {
            this.pathData[this.pathData.length - 2] = lastPoint;
        } else {
            this.pathData.push(lastPoint);
        }
        if (this.align) {
            this.pathData.push(this.alignement);
            this.align = false;
        }
        this.drawStraightLines(this.drawingService.baseCtx);
        this.mouseDown = false;
        this.clearPath();
    }

    onKeyRelease(event: KeyboardEvent): void {
        if (!event.shiftKey && !this.doubleClick) {
            this.align = false;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawStraightLines(this.drawingService.previewCtx);
            this.drawStraightLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.mousePosition);
        }
    }

    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.keyEscape = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.mouseDown = false;
            this.clearPath();
        } else if (event.key === 'Backspace') {
            this.keyBackspace = true;
            if (this.pathData.length > 1) {
                this.pathData.pop();
            }
        } else if (event.shiftKey && !this.doubleClick) {
            this.align = true;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawStraightLines(this.drawingService.previewCtx);
            this.alignement = this.computeAngle(this.pathData, this.mousePosition);
            this.drawStraightLine(this.drawingService.previewCtx, this.pathData[this.pathData.length - 1], this.alignement);
        }
    }

    private computeAngle(path: Vec2[], currentClick: Vec2): Vec2 {
        let pointAlign: Vec2;
        const lastClick = path[path.length + SIGN];
        const deltaX = currentClick.x - lastClick.x;
        const deltaY = currentClick.y - lastClick.y;
        const angleRad = Math.abs(Math.atan2(deltaY, deltaX));
        if (angleRad < ANGLE_22 || angleRad > ANGLE_157) {
            pointAlign = { x: currentClick.x, y: lastClick.y };
        } else if (angleRad >= ANGLE_22 && angleRad <= ANGLE_67) {
            const constY: number = deltaY > 0 ? SIGN : 1;
            const newY: number = Math.round(Math.tan(ANGLE_135) * deltaX * constY);
            pointAlign = { x: currentClick.x, y: lastClick.y + newY };
        } else if (angleRad <= ANGLE_157 && angleRad >= ANGLE_112) {
            const constY: number = deltaY > 0 ? SIGN : 1;
            const newY: number = Math.round(Math.tan(ANGLE_45) * deltaX * constY);
            pointAlign = { x: currentClick.x, y: lastClick.y + newY };
        } else {
            pointAlign = { x: lastClick.x, y: currentClick.y };
        }
        return pointAlign;
    }

    private distanceTwoPoints(startPoint: Vec2, lastPoint: Vec2): number {
        const distance = Math.sqrt(Math.pow(lastPoint.x - startPoint.x, 2) + Math.pow(lastPoint.y - startPoint.y, 2));
        return distance;
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
