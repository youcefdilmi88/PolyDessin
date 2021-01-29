import { Injectable } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { MagnetAnchor } from '@enums/magnet-anchor';
import { ToolShortcut } from '@enums/tool-shortcut';
import { ToolManagerService } from '@services/tool-manager/tool-manager.service';
import { ClipboardService } from '@tools/clipboard-service/clipboard.service';
import { EyedropperService } from '@tools/eyedropper-service/eyedropper.service';
import { FeatherService } from '@tools/feather-service/feather.service';
import { SelectionEllipseService } from '@tools/selection/selection-ellipse/selection-ellipse.service';
import { SelectionRectangleService } from '@tools/selection/selection-rectangle/selection-rectangle.service';
import { SelectionService } from '@tools/selection/selection-service/selection.service';
import { StampService } from '@tools/stamp-service/stamp.service';
import { TextService } from '@tools/text/text.service';

const LAST2DIGITS = -2;
const MIN_SQUARE_SIZE = 10;
const MAX_OPACITY = 100;

@Injectable({
    providedIn: 'root',
})
export class HandlingService {
    constructor(
        public toolManagerService: ToolManagerService,
        public eyeDropperService: EyedropperService,
        public textService: TextService,
        public featherService: FeatherService,
        public stampService: StampService,
        public selectionService: SelectionService,
        public clipboardService: ClipboardService,
        public selectionRectangleService: SelectionRectangleService,
    ) {}
    currentPrimaryColor: string = '#000000ff';
    currentSecondaryColor: string = '#000000ff';

    handleLineWidthSelection(event: MatSliderChange, currentLineWidth: number): void {
        currentLineWidth = event.value ? event.value : 1;
        this.toolManagerService.selectLineWidth(currentLineWidth);
        currentLineWidth = this.toolManagerService.currentLineWidth;
    }

    isTransparent(color: string): string {
        color = this.changeColorForEyedropper(color);
        return color.slice(LAST2DIGITS) === '00' && color !== '#000000' ? 'white' : color;
    }

    setEyeDropColor(color: string): string {
        if (!this.eyeDropperService.isCanvas) color = '#d9d9d9';
        return color.slice(LAST2DIGITS) === '00' && color !== '#000000' ? 'white' : color;
    }

    changeColorForEyedropper(color: string): string {
        if (this.eyeDropperService.isLeftClick) {
            this.eyeDropperService.isRightClick = false;
            this.currentPrimaryColor = this.eyeDropperService.currentColor;
            color = this.eyeDropperService.currentColor;
            this.toolManagerService.selectCurrentPrimaryColor(this.eyeDropperService.currentColor);
            this.eyeDropperService.isLeftClick = false;
        } else if (this.eyeDropperService.isRightClick) {
            this.eyeDropperService.isLeftClick = false;
            this.currentSecondaryColor = this.eyeDropperService.currentColor;
            color = this.eyeDropperService.currentColor;
            this.toolManagerService.selectCurrentSecondaryColor(this.eyeDropperService.currentColor);
            this.eyeDropperService.isRightClick = false;
        }
        return color;
    }

    handleAlignment(alignment: string): void {
        if (alignment === 'right') {
            this.textService.currentAlignmentRight = !this.textService.currentAlignmentRight;
            this.toolManagerService.selectAlignment(alignment, this.textService.currentAlignmentRight);
        }
        if (alignment === 'left') {
            this.textService.currentAlignmentLeft = !this.textService.currentAlignmentLeft;
            this.toolManagerService.selectAlignment(alignment, this.textService.currentAlignmentLeft);
        }
        if (alignment === 'center') {
            this.textService.currentAlignmentCenter = !this.textService.currentAlignmentCenter;
            this.toolManagerService.selectAlignment(alignment, this.textService.currentAlignmentCenter);
        }
    }

    handleGridSquareSizeSelection(event: MatSliderChange): void {
        const gridSquareSize = event.value ? event.value : MIN_SQUARE_SIZE;
        const selectionEllipseService = this.toolManagerService.getToolService.getTool(ToolShortcut.SelectionEllipse) as SelectionEllipseService;
        const selectionRectangleService = this.toolManagerService.getToolService.getTool(
            ToolShortcut.SelectionRectangle,
        ) as SelectionRectangleService;
        selectionEllipseService.currentGridSquareSize = gridSquareSize;
        selectionRectangleService.currentGridSquareSize = gridSquareSize;
        this.toolManagerService.currentGridSquareSize = gridSquareSize;
    }

    selectAnchorMagnet(event: MouseEvent): void {
        const magnetAnchor = (event.currentTarget as HTMLElement).id;
        const selectionEllipseService = this.toolManagerService.getToolService.getTool(ToolShortcut.SelectionEllipse) as SelectionEllipseService;
        const selectionRectangleService = this.toolManagerService.getToolService.getTool(
            ToolShortcut.SelectionRectangle,
        ) as SelectionRectangleService;
        switch (magnetAnchor) {
            case 'top-left':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.TopLeft;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.TopLeft;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.TopLeft;
                break;
            case 'top-center':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.TopCenter;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.TopCenter;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.TopCenter;
                break;
            case 'top-right':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.TopRight;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.TopRight;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.TopRight;
                break;
            case 'center-left':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.CenterLeft;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.CenterLeft;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.CenterLeft;
                break;
            case 'center-center':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.CenterCenter;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.CenterCenter;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.CenterCenter;
                break;
            case 'center-right':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.CenterRight;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.CenterRight;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.CenterRight;
                break;
            case 'bottom-left':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.BottomLeft;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.BottomLeft;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.BottomLeft;
                break;
            case 'bottom-center':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.BottomCenter;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.BottomCenter;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.BottomCenter;
                break;
            case 'bottom-right':
                selectionEllipseService.currentMagnetAnchor = MagnetAnchor.BottomRight;
                selectionRectangleService.currentMagnetAnchor = MagnetAnchor.BottomRight;
                this.toolManagerService.currentMagnetAnchor = MagnetAnchor.BottomRight;
                break;
            default:
                break;
        }
    }

    toggleMagnetism(): void {
        this.toolManagerService.isMagnetismOn = !this.toolManagerService.isMagnetismOn;
        const selectionEllipseService = this.toolManagerService.getToolService.getTool(ToolShortcut.SelectionEllipse) as SelectionEllipseService;
        const selectionRectangleService = this.toolManagerService.getToolService.getTool(
            ToolShortcut.SelectionRectangle,
        ) as SelectionRectangleService;
        selectionEllipseService.isMagnetismOn = !selectionEllipseService.isMagnetismOn;
        selectionRectangleService.isMagnetismOn = !selectionRectangleService.isMagnetismOn;
    }

    handleGridOpacitySelection(event: MatSliderChange): void {
        this.toolManagerService.currentGridOpacity = event.value ? event.value : MAX_OPACITY;
    }
}
