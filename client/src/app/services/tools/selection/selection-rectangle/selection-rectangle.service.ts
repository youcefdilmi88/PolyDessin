import { Injectable } from '@angular/core';
import { Vec2 } from '@classes/vec2';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionService } from '@tools/selection/selection-service/selection.service';

const ANGLE_180 = 180;
const LINE_DASH = 3;

@Injectable({
    providedIn: 'root',
})
export class SelectionRectangleService extends SelectionService {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.SelectionRectangle;

    drawPreview(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        this.width = this.mousePosition.x - this.mouseDownCoord.x;
        this.height = this.mousePosition.y - this.mouseDownCoord.y;
        ctx.beginPath();
        ctx.setLineDash([LINE_DASH]);
        if (event.shiftKey) {
            this.shiftPressed = true;
            this.width = this.height;
        }
        ctx.strokeStyle = '#000000';
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;
        ctx.strokeRect(this.mouseDownCoord.x, this.mouseDownCoord.y, this.width, this.height);
        this.saveSelection();
    }

    drawSelectionRectangle(ctx: CanvasRenderingContext2D, mousePosition: Vec2, topLeftX: number, topLeftY: number): void {
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
        ctx.lineWidth = 1;
        let topLeftX = this.newPoint.x + mousePosition.x - this.selectionMouseDown.x;
        let topLeftY = this.newPoint.y + mousePosition.y - this.selectionMouseDown.y;
        let computedTopLeft: Vec2;
        if (this.isMagnetismOn) {
            topLeftX = Math.round(topLeftX / this.currentGridSquareSize) * this.currentGridSquareSize;
            topLeftY = Math.round(topLeftY / this.currentGridSquareSize) * this.currentGridSquareSize;
            computedTopLeft = this.computeMagnetTopCorner({ x: topLeftX, y: topLeftY });
            this.drawSelectionRectangle(
                ctx,
                mousePosition,
                computedTopLeft.x + this.currentGridSquareSize,
                computedTopLeft.y + this.currentGridSquareSize,
            );
        } else {
            this.drawSelectionRectangle(ctx, mousePosition, topLeftX, topLeftY);
        }
    }

    clearSelection(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.newPoint.x, this.newPoint.y, this.selectionWidth, this.selectionHeight);
    }
}
