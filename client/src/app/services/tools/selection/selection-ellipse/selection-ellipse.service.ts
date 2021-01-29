import { Injectable } from '@angular/core';
import { Vec2 } from '@classes/vec2';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionService } from '@tools/selection/selection-service/selection.service';

const ANGLE_180 = 180;
const END_ANGLE = 7;
const LINE_DASH = 3;
@Injectable({
    providedIn: 'root',
})
export class SelectionEllipseService extends SelectionService {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.SelectionEllipse;
    radianX: number;
    radianY: number;

    drawSelectionEllipse(ctx: CanvasRenderingContext2D, mousePosition: Vec2, topLeftX: number, topLeftY: number): void {
        ctx.save();
        ctx.beginPath();
        ctx.translate(
            this.selectionMiddle.x + mousePosition.x - this.selectionMouseDown.x,
            this.selectionMiddle.y + mousePosition.y - this.selectionMouseDown.y,
        );
        ctx.rotate((Math.PI * this.currentSelectionAngle) / ANGLE_180);
        ctx.translate(
            -this.selectionMiddle.x - mousePosition.x + this.selectionMouseDown.x,
            -this.selectionMiddle.y - mousePosition.y + this.selectionMouseDown.y,
        );
        ctx.ellipse(
            topLeftX + this.selectionWidth / 2,
            topLeftY + this.selectionHeight / 2,
            this.selectionWidth / 2,
            this.selectionHeight / 2,
            0,
            0,
            END_ANGLE,
        );
        ctx.clip();
        ctx.drawImage(
            this.selectionData,
            this.newPoint.x,
            this.newPoint.y,
            this.selectionWidth,
            this.selectionHeight,
            topLeftX,
            topLeftY,
            this.selectionWidth,
            this.selectionHeight,
        );
        ctx.restore();
    }

    drawSelection(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        let topLeftX = this.newPoint.x + mousePosition.x - this.selectionMouseDown.x;
        let topLeftY = this.newPoint.y + mousePosition.y - this.selectionMouseDown.y;
        let computedTopLeft: Vec2;
        if (this.isMagnetismOn) {
            topLeftX = Math.round(topLeftX / this.currentGridSquareSize) * this.currentGridSquareSize;
            topLeftY = Math.round(topLeftY / this.currentGridSquareSize) * this.currentGridSquareSize;
            computedTopLeft = this.computeMagnetTopCorner({ x: topLeftX, y: topLeftY });
            this.drawSelectionEllipse(
                ctx,
                mousePosition,
                computedTopLeft.x + this.currentGridSquareSize,
                computedTopLeft.y + this.currentGridSquareSize,
            );
        } else {
            this.drawSelectionEllipse(ctx, mousePosition, topLeftX, topLeftY);
        }
    }

    drawPreview(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        this.width = this.mousePosition.x - this.mouseDownCoord.x;
        this.height = this.mousePosition.y - this.mouseDownCoord.y;
        this.radianX = Math.abs(
            this.mousePosition.x -
                this.mouseDownCoord.x -
                (this.mouseDownCoord.x < this.mousePosition.x ? this.currentLineWidth : -this.currentLineWidth),
        );
        this.radianY = Math.abs(
            this.mousePosition.y -
                this.mouseDownCoord.y -
                (this.mouseDownCoord.y < this.mousePosition.y ? this.currentLineWidth : -this.currentLineWidth),
        );
        if (event.shiftKey) {
            this.width = this.height;
            this.shiftPressed = true;
        }
        this.drawEllipse(ctx, this.width / 2, this.height / 2);
        ctx.stroke();
        this.saveSelection();
    }

    drawEllipse(ctx: CanvasRenderingContext2D, radianX: number, radianY: number): void {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.setLineDash([LINE_DASH]);
        const xMiddle = this.mouseDownCoord.x + radianX;
        const yMiddle = this.mouseDownCoord.y + radianY;
        this.radianEllipse.x = Math.abs(radianX);
        this.radianEllipse.y = Math.abs(radianY);
        ctx.ellipse(xMiddle, yMiddle, this.radianEllipse.x, this.radianEllipse.y, 0, 0, END_ANGLE);
    }

    clearSelection(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.ellipse(
            this.newPoint.x + this.selectionWidth / 2,
            this.newPoint.y + this.selectionHeight / 2,
            this.selectionWidth / 2,
            this.selectionHeight / 2,
            0,
            0,
            END_ANGLE,
        );
        ctx.fill();
    }
}
