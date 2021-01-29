import { EventEmitter, Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Tool } from '@classes/tool';
import { MagnetAnchor } from '@enums/magnet-anchor';
import { ToolShortcut } from '@enums/tool-shortcut';
import { GetToolService } from '@services/get-tool/get-tool.service';
import { BrushService } from '@tools/brush-service/brush.service';
import { EllipseService } from '@tools/ellipse-service/ellipse.service';
import { LineService } from '@tools/line-service/line.service';
import { PaintBucketService } from '@tools/paint-bucket-service/paint-bucket.service';
import { PencilService } from '@tools/pencil-service/pencil.service';
import { PolygonService } from '@tools/polygon-service/polygon.service';
import { RectangleService } from '@tools/rectangle-service/rectangle.service';
import { SprayService } from '@tools/spray-service/spray.service';
import { StampService } from '@tools/stamp-service/stamp.service';
import { TextService } from '@tools/text/text.service';

const LINE_WIDTH = 5;

@Injectable({
    providedIn: 'root',
})
export class ToolManagerService {
    constructor(pencilService: PencilService, public getToolService: GetToolService) {
        this.currentTool = pencilService;
    }
    currentTool: Tool;
    currentLineWidth: number;
    currentRadius: number;
    eraserFirstTimeFlag: boolean = true;
    currentFeatherLineHeight: number;
    currentFeatherAngle: number;
    currentSprayDiameter: number;
    currentSprayEmissionInterval: number;
    currentDotDiameter: number;
    currentStampAngle: number;
    currentScale: number;
    currentEyedropColor: string;
    currentPrimaryColor: string;
    currentSecondaryColor: string;
    currentPrimaryAlpha: number;
    currentSecondaryAlpha: number;
    isGridOn: boolean = false;
    previousGridOpacity: number = 100;
    currentGridOpacity: number = 100;
    previousGridSquareSize: number = 20;
    currentGridSquareSize: number = 20;
    isMagnetismOn: boolean = false;
    currentMagnetAnchor: MagnetAnchor = MagnetAnchor.TopLeft;
    currentSelectionAngle: number;
    currentSidesNumber: number;

    toolChangeEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
    isDialogOpenedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    selectToolFromUserInput(toolKey: ToolShortcut): void {
        this.currentTool = this.getToolService.getTool(toolKey);
        if (toolKey === ToolShortcut.Eraser && this.eraserFirstTimeFlag) {
            this.eraserFirstTimeFlag = false;
            (this.currentTool as DrawTool).currentLineWidth = LINE_WIDTH;
        }
        this.currentLineWidth = (this.currentTool as DrawTool).currentLineWidth;
    }

    selectLineWidth(lineWidth: number): void {
        (this.currentTool as DrawTool).setCurrentLineWidth(lineWidth);
        this.currentLineWidth = (this.currentTool as DrawTool).currentLineWidth;
    }

    selectBrushTexture(texture: string): void {
        (this.currentTool as BrushService).setCurrentTexture(texture);
    }

    selectFeatherLineHeight(lineHeight: number): void {
        (this.currentTool as DrawTool).setCurrentFeatherLineHeight(lineHeight);
        this.currentFeatherLineHeight = (this.currentTool as DrawTool).currentFeatherLineHeight;
    }

    selectFeatherAngle(angle: number): void {
        (this.currentTool as DrawTool).setCurrentFeatherAngle(angle);
        this.currentFeatherAngle = (this.currentTool as DrawTool).currentFeatherAngle;
    }

    selectSprayDiameter(diameter: number): void {
        (this.currentTool as SprayService).setSprayDiameter(diameter);
        this.currentSprayDiameter = diameter;
    }

    selectSprayEmissionInterval(interval: number): void {
        (this.currentTool as SprayService).setEmissionInterval(interval);
        this.currentSprayEmissionInterval = interval;
    }

    selectSprayDotDiameter(diameter: number): void {
        (this.currentTool as SprayService).setDotDiameter(diameter);
        this.currentDotDiameter = diameter;
    }

    selectStamp(stamp: string): void {
        (this.currentTool as StampService).setCurrentStamp(stamp);
    }

    selectStampScale(scale: number): void {
        (this.currentTool as StampService).setCurrentScale(scale);
        this.currentScale = scale;
    }

    selectStampAngle(angle: number): void {
        (this.currentTool as StampService).setCurrentStampAngle(angle);
        this.currentStampAngle = (this.currentTool as DrawTool).currentStampAngle;
    }

    selectSelectionAngle(angle: number): void {
        (this.currentTool as DrawTool).setCurrentSelectionAngle(angle);
        this.currentSelectionAngle = (this.currentTool as DrawTool).currentSelectionAngle;
    }

    selectPaintBucketTolerance(tolerance: number): void {
        (this.currentTool as PaintBucketService).setCurrentTolerance(tolerance);
    }

    selectRectangleBehavior(behavior: string): void {
        (this.currentTool as RectangleService).setCurrentBehavior(behavior);
    }

    selectEllipseBehavior(behavior: string): void {
        (this.currentTool as EllipseService).setCurrentBehavior(behavior);
    }

    selectPointWidth(radius: number): void {
        (this.currentTool as LineService).setCurrentDiameter(radius);
        this.currentRadius = radius;
    }

    selectPolygonBehavior(behavior: string): void {
        (this.currentTool as PolygonService).setCurrentBehavior(behavior);
    }

    selectPolygonSides(sides: number): void {
        (this.currentTool as PolygonService).setCurrentSideNumber(sides);
        this.currentSidesNumber = sides;
    }

    selectTextFont(font: string): void {
        ((this.currentTool as unknown) as TextService).setCurrentFont(font);
    }

    selectTextSize(size: string): void {
        ((this.currentTool as unknown) as TextService).setCurrentFontSize(size);
    }

    selectBold(status: boolean): void {
        ((this.currentTool as unknown) as TextService).setCurrentBold(status);
    }

    selectItalic(status: boolean): void {
        ((this.currentTool as unknown) as TextService).setCurrentItalic(status);
    }

    selectAlignment(alignment: string, status: boolean): void {
        ((this.currentTool as unknown) as TextService).setCurrentAlignment(alignment, status);
    }

    selectCurrentGridSquareSize(gridSquareSize: number): void {
        this.currentGridSquareSize = gridSquareSize;
    }

    selectCurrentPrimaryColor(color: string): void {
        this.getToolService.tools.forEach((tool) => {
            (tool as DrawTool).setCurrentPrimaryColor(color);
        });
        this.currentPrimaryColor = color;
    }

    selectCurrentSecondaryColor(color: string): void {
        this.getToolService.tools.forEach((tool) => {
            (tool as DrawTool).setCurrentSecondaryColor(color);
        });
        this.currentSecondaryColor = color;
    }

    selectCurrentPrimaryAlpha(alpha: number): void {
        this.getToolService.tools.forEach((tool) => {
            (tool as DrawTool).setCurrentPrimaryAlpha(alpha);
        });
        this.currentPrimaryAlpha = alpha;
    }

    selectCurrentSecondaryAlpha(alpha: number): void {
        this.getToolService.tools.forEach((tool) => {
            (tool as DrawTool).setCurrentSecondaryAlpha(alpha);
        });
        this.currentSecondaryAlpha = alpha;
    }
}
