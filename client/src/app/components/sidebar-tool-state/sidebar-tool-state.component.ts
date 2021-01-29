import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { MagnetAnchor } from '@enums/magnet-anchor';
import { ToolName } from '@enums/tool-name';
import { ToolShortcut } from '@enums/tool-shortcut';
import { HandlingService } from '@services/handling/handling.service';
import { ToolManagerService } from '@services/tool-manager/tool-manager.service';
import { ClipboardService } from '@tools/clipboard-service/clipboard.service';
import { EyedropperService } from '@tools/eyedropper-service/eyedropper.service';
import { FeatherService } from '@tools/feather-service/feather.service';
import { RectangleService } from '@tools/rectangle-service/rectangle.service';
import { SelectionEllipseService } from '@tools/selection/selection-ellipse/selection-ellipse.service';
import { SelectionRectangleService } from '@tools/selection/selection-rectangle/selection-rectangle.service';
import { SelectionService } from '@tools/selection/selection-service/selection.service';
import { StampService } from '@tools/stamp-service/stamp.service';
import { TextService } from '@tools/text/text.service';
import { Subscription } from 'rxjs';

const LAST2DIGITS = -2;
const MIN_SQUARE_SIZE = 10;
const MAX_OPACITY = 100;

@Component({
    selector: 'app-sidebar-tool-state',
    templateUrl: './sidebar-tool-state.component.html',
    styleUrls: ['./sidebar-tool-state.component.scss'],
})
export class SidebarToolStateComponent implements OnInit, OnDestroy {
    constructor(
        public toolManagerService: ToolManagerService,
        public eyeDropperService: EyedropperService,
        public textService: TextService,
        public featherService: FeatherService,
        public stampService: StampService,
        public selectionService: SelectionService,
        public clipboardService: ClipboardService,
        public selectionRectangleService: SelectionRectangleService,
        private selectionEllipseService: SelectionEllipseService,
        public handlingService: HandlingService,
    ) {}
    currentTool: ToolName = ToolName.Pencil;
    localToolEnum: typeof ToolName = ToolName;
    isDialogOpened: boolean = false;
    currentLineWidth: number = 1;
    currentRadius: number;
    currentBrushTexture: string = 'Texture 1';
    currentRectangleBehavior: string = 'Contour seulement';
    currentFeatherLineHeight: number = 2;
    currentFeatherAngle: number = 0;
    currentSprayDiameter: number;
    currentSprayInterval: number;
    currentSprayDotDiameter: number;
    currentStamp: string = 'Étampe 1';
    currentStampScale: number;
    currentStampAngle: number;
    currentPaintBucketTolerance: number;
    currentFont: string = 'Arial';
    currentFontSize: string = '26';
    currentBoldStatus: boolean = false;
    currentItalicStatus: boolean = false;
    primaryColorSelected: boolean = true;
    currentPrimaryColor: string = '#000000ff';
    currentSecondaryColor: string = '#000000ff';
    currentPrimaryAlpha: number;
    currentSecondaryAlpha: number;
    colorIndex: number;
    opacityValue: number;
    currentSidesNumber: number = 3;
    currentSelectionAngle: number;
    localMagnetAnchorEnum: typeof MagnetAnchor = MagnetAnchor;
    private angleFeatherSubscription: Subscription;
    private angleStampSubscription: Subscription;
    private angleSelectionSubscription: Subscription;
    private angleSelectionEllipseSubscription: Subscription;
    toolsMap: Map<ToolName, string> = new Map([
        [ToolName.Pencil, 'Crayon (c)'],
        [ToolName.Brush, 'Pinceau (w)'],
        [ToolName.Line, 'Ligne (l)'],
        [ToolName.Eraser, 'Efface (e)'],
        [ToolName.Rectangle, 'Rectangle (1)'],
        [ToolName.Ellipse, 'Ellipse (2)'],
        [ToolName.Polygon, 'Polygone (3)'],
        [ToolName.PaintBucket, 'Sceau de peinture (b)'],
        [ToolName.Eyedropper, 'Pipette (i)'],
        [ToolName.SelectionRectangle, 'Sélection Rectangle (r)'],
        [ToolName.SelectionEllipse, 'Sélection Ellipse (s)'],
        [ToolName.Spray, 'Aérosol (a)'],
        [ToolName.Stamp, 'Étampe (d)'],
        [ToolName.Feather, 'Plume (p)'],
        [ToolName.Text, 'Texte (t)'],
    ]);
    toolsUsingLineWidth: ToolName[] = [
        ToolName.Pencil,
        ToolName.Brush,
        ToolName.Line,
        ToolName.Eraser,
        ToolName.Rectangle,
        ToolName.Ellipse,
        ToolName.Polygon,
    ];

    @ViewChild('canvasImg', { static: true }) canvasImg: ElementRef<HTMLCanvasElement>;

    ngOnInit(): void {
        this.toolManagerService.toolChangeEmitter.subscribe(() => {
            this.currentTool = this.toolManagerService.currentTool.toolName;
            this.currentLineWidth = this.toolManagerService.currentLineWidth;
        });
        this.toolManagerService.isDialogOpenedEmitter.subscribe((isOpened: boolean) => {
            this.isDialogOpened = isOpened;
        });
        this.eyeDropperService.miniCanvas = this.canvasImg.nativeElement;
        this.angleFeatherSubscription = this.featherService.angle.subscribe((angle) => (this.currentFeatherAngle = angle));
        this.angleStampSubscription = this.stampService.stampAngle.subscribe((angle) => (this.currentStampAngle = angle));
        this.angleSelectionSubscription = this.selectionRectangleService.selectionAngle.subscribe((angle) => (this.currentSelectionAngle = angle));
        this.angleSelectionEllipseSubscription = this.selectionEllipseService.selectionAngle.subscribe(
            (angle) => (this.currentSelectionAngle = angle),
        );
    }

    ngOnDestroy(): void {
        this.angleFeatherSubscription.unsubscribe();
        this.angleStampSubscription.unsubscribe();
        this.angleSelectionSubscription.unsubscribe();
        this.angleSelectionEllipseSubscription.unsubscribe();
    }

    getCurrentToolName(): string | undefined {
        for (const key of this.toolsMap.keys()) {
            if (key === this.currentTool) {
                return this.toolsMap.get(key);
            }
        }
        return '';
    }

    assignPrimaryColor(): void {
        this.primaryColorSelected = true;
    }

    assignSecondaryColor(): void {
        this.primaryColorSelected = false;
    }

    invertPrimaryAndSecondaryColor(): void {
        let temporary: string;
        temporary = this.currentPrimaryColor;
        this.currentPrimaryColor = this.currentSecondaryColor;
        this.currentSecondaryColor = temporary;
        this.toolManagerService.selectCurrentPrimaryColor(this.currentPrimaryColor);
        this.toolManagerService.selectCurrentSecondaryColor(this.currentSecondaryColor);
    }

    onColorChange(event: string): void {
        if (this.primaryColorSelected) {
            this.currentPrimaryColor = event;
            this.toolManagerService.selectCurrentPrimaryColor(this.currentPrimaryColor);
        } else {
            this.currentSecondaryColor = event;
            this.toolManagerService.selectCurrentSecondaryColor(this.currentSecondaryColor);
        }
    }

    onAlphaOutput(event: number): void {
        if (this.primaryColorSelected) {
            this.currentPrimaryAlpha = event;
            this.toolManagerService.selectCurrentPrimaryAlpha(this.currentPrimaryAlpha);
        } else {
            this.currentSecondaryAlpha = event;
            this.toolManagerService.selectCurrentSecondaryAlpha(this.currentSecondaryAlpha);
        }
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

    handleLineWidthSelection(event: MatSliderChange): void {
        this.handlingService.handleLineWidthSelection(event, this.currentLineWidth);
    }

    handleClickBrushTextureSelection(event: MouseEvent): void {
        this.currentBrushTexture = (event.currentTarget as HTMLElement).id;
        this.toolManagerService.selectBrushTexture(this.currentBrushTexture);
    }

    handleFeatherLineHeightSelection(event: MatSliderChange): void {
        this.currentFeatherLineHeight = event.value ? event.value : 1;
        this.toolManagerService.selectFeatherLineHeight(this.currentFeatherLineHeight);
        this.currentFeatherLineHeight = this.toolManagerService.currentFeatherLineHeight;
    }

    angleLabel(value: number): number {
        return Math.round(value);
    }

    updateFeatherAngle(event: MatSliderChange): void {
        this.toolManagerService.selectFeatherAngle(event.value ?? 0); // if undefined, will put to 0
    }

    handleEmissionInterval(event: MatSliderChange): void {
        this.currentSprayInterval = event.value ? event.value : 1;
        this.toolManagerService.selectSprayEmissionInterval(this.currentSprayInterval);
        this.currentSprayInterval = this.toolManagerService.currentSprayEmissionInterval;
    }

    handleSprayDiameterSelection(event: MatSliderChange): void {
        this.currentSprayDiameter = event.value ? event.value : 1;
        this.toolManagerService.selectSprayDiameter(this.currentSprayDiameter);
        this.currentSprayDiameter = this.toolManagerService.currentSprayDiameter;
    }

    handleDotDiameterSelection(event: MatSliderChange): void {
        this.currentSprayDotDiameter = event.value ? event.value : 1;
        this.toolManagerService.selectSprayDotDiameter(this.currentSprayDotDiameter);
        this.currentSprayDotDiameter = this.toolManagerService.currentDotDiameter;
    }

    handleStampSelection(event: MouseEvent): void {
        this.currentStamp = (event.currentTarget as HTMLElement).id;
        this.toolManagerService.selectStamp(this.currentStamp);
    }

    handleScaleSelection(event: MatSliderChange): void {
        this.currentStampScale = event.value ? event.value : 1;
        this.toolManagerService.selectStampScale(this.currentStampScale);
        this.currentStampScale = this.toolManagerService.currentScale;
    }

    handleStampAngle(event: MatSliderChange): void {
        this.toolManagerService.selectStampAngle(event.value ?? 0); // if undefined, will put to 0
    }

    handleSelectionAngle(event: MatSliderChange): void {
        this.toolManagerService.selectSelectionAngle(event.value ?? 0); // if undefined, will put to 0
    }

    handleClickRectangleBehavior(event: MouseEvent): void {
        this.currentRectangleBehavior = (event.currentTarget as HTMLElement).id;
        this.toolManagerService.selectRectangleBehavior(this.currentRectangleBehavior);
    }

    @HostListener('document:keydown.shift', ['$event'])
    handleKeyboardShiftDown(event: KeyboardEvent): void {
        if (this.currentTool === ToolName.Rectangle && !this.isDialogOpened) {
            (this.toolManagerService.currentTool as RectangleService).squareEnabled = true;
            (this.toolManagerService.currentTool as RectangleService).drawOnSquareToggle();
        }
    }

    @HostListener('document:keyup.shift', ['$event'])
    handleKeyboardShiftUp(event: KeyboardEvent): void {
        if (this.currentTool === ToolName.Rectangle && !this.isDialogOpened) {
            (this.toolManagerService.currentTool as RectangleService).squareEnabled = false;
            (this.toolManagerService.currentTool as RectangleService).drawOnSquareToggle();
        }
    }

    handlePointWidthSelection(event: MatSliderChange): void {
        this.currentRadius = event.value ? event.value : 1;
        this.toolManagerService.selectPointWidth(this.currentRadius);
    }

    handleSidesNumberSelection(event: MatSliderChange): void {
        this.currentSidesNumber = event.value ? event.value : 1;
        this.toolManagerService.selectPolygonSides(this.currentSidesNumber);
        this.currentSidesNumber = this.toolManagerService.currentSidesNumber;
    }

    handleFontSelection(event: MouseEvent): void {
        this.currentFont = (event.currentTarget as HTMLElement).id;
        this.toolManagerService.selectTextFont(this.currentFont);
    }

    handleFontSizeSelection(event: MouseEvent): void {
        this.currentFontSize = (event.currentTarget as HTMLElement).id;
        this.toolManagerService.selectTextSize(this.currentFontSize);
    }

    handleBold(event: MouseEvent): void {
        this.currentBoldStatus = !this.currentBoldStatus;
        this.toolManagerService.selectBold(this.currentBoldStatus);
    }

    handleItalic(event: MouseEvent): void {
        this.currentItalicStatus = !this.currentItalicStatus;
        this.toolManagerService.selectItalic(this.currentItalicStatus);
    }

    handleAlignment(alignment: string): void {
        this.handlingService.handleAlignment(alignment);
    }

    handleToleranceSelection(event: MatSliderChange): void {
        this.currentPaintBucketTolerance = event.value ? event.value : 0;
        this.toolManagerService.selectPaintBucketTolerance(this.currentPaintBucketTolerance);
    }

    handleClickEyedropperSelection(event: MouseEvent): void {
        this.currentRectangleBehavior = (event.currentTarget as HTMLElement).id;
        this.toolManagerService.selectCurrentPrimaryColor(this.currentRectangleBehavior);
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

    handleGridOpacitySelection(event: MatSliderChange): void {
        this.toolManagerService.currentGridOpacity = event.value ? event.value : MAX_OPACITY;
    }

    toggleMagnetism(): void {
        this.handlingService.toggleMagnetism();
    }

    selectAnchorMagnet(event: MouseEvent): void {
        this.handlingService.selectAnchorMagnet(event);
    }
}
