import { Tool } from '@classes/tool';
import { DrawingService } from '@services/drawing/drawing.service';

export class DrawTool extends Tool {
    constructor(protected drawingService: DrawingService) {
        super(drawingService);
    }
    currentLineWidth: number = 1;
    currentRadius: number = 1;
    currentPrimaryColor: string = '#000000ff';
    currentSecondaryColor: string = '#000000ff';
    currentOpacity: number;
    currentPrimaryAlpha: number = 1;
    currentSecondaryAlpha: number = 1;
    currentFeatherLineHeight: number = 1;
    currentFeatherAngle: number = 0;
    currentStampAngle: number = 0;
    currentStampScale: number = 1;
    currentSelectionAngle: number = 0;

    setCurrentLineWidth(lineWidth: number): void {
        this.currentLineWidth = lineWidth;
    }

    setCurrentDiameter(radius: number): void {
        this.currentRadius = radius;
    }

    setCurrentPrimaryColor(color: string): void {
        this.currentPrimaryColor = color;
    }

    setCurrentSecondaryColor(color: string): void {
        this.currentSecondaryColor = color;
    }

    setCurrentPrimaryAlpha(alpha: number): void {
        this.currentPrimaryAlpha = alpha;
    }

    setCurrentSecondaryAlpha(alpha: number): void {
        this.currentSecondaryAlpha = alpha;
    }

    setCurrentFeatherLineHeight(lineHeight: number): void {
        this.currentFeatherLineHeight = lineHeight;
    }

    setCurrentFeatherAngle(featherAngle: number): void {
        this.currentFeatherAngle = featherAngle;
    }

    setCurrentStampAngle(stampAngle: number): void {
        this.currentStampAngle = stampAngle;
    }

    setCurrentSelectionAngle(selectionAngle: number): void {
        this.currentSelectionAngle = selectionAngle;
    }
}
