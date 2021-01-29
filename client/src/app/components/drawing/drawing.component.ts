import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { OffsetGrabberCouple } from '@classes/offset-grabber-couple';
import { Tool } from '@classes/tool';
import { Vec2 } from '@classes/vec2';
import { Side } from '@enums/side';
import { ToolName } from '@enums/tool-name';
import { AutosaveService } from '@services/autosave/autosave.service';
import { CanvasResizerService } from '@services/canvas-resizer/canvas-resizer.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { ToolManagerService } from '@services/tool-manager/tool-manager.service';
import { UndoRedoService } from '@services/undo-redo/undo-redo.service';
import { ClipboardService } from '@tools/clipboard-service/clipboard.service';
import { EyedropperService } from '@tools/eyedropper-service/eyedropper.service';
import { PolygonService } from '@tools/polygon-service/polygon.service';
import { TextService } from '@tools/text/text.service';

const GRABBER_OFFSET_3PX = 3;
const GRABBER_OFFSET1 = 250;
const GRABBER_OFFSET2 = 600;
const GRABBER_OFFSET3 = 352;
const GRABBER_OFFSET4 = 350;
const GRABBER_OFFSET5 = 50;

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit {
    constructor(
        private drawingService: DrawingService,
        private toolManagerService: ToolManagerService,
        public autosaveService: AutosaveService,
        public canvasResizerService: CanvasResizerService,
        public undoRedoService: UndoRedoService,
        public polygonService: PolygonService,
        public eyedropperService: EyedropperService,
        public txtService: TextService,
        public clipboardService: ClipboardService,
    ) {}

    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('rightGrabber', { static: false }) rightGrabberElementRef: ElementRef;
    rightGrabberElement: HTMLElement;
    @ViewChild('bottomGrabber', { static: false }) bottomGrabberRef: ElementRef;
    bottomGrabberElement: HTMLElement;
    @ViewChild('cornerGrabber', { static: false }) cornerGrabberRef: ElementRef;
    cornerGrabberElement: HTMLElement;

    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    currentTool: Tool;
    rightGrabberPosition: Vec2 = { x: 0, y: 0 };
    bottomGrabberPosition: Vec2 = { x: 0, y: 0 };
    cornerGrabberPosition: Vec2 = { x: 0, y: 0 };

    ngAfterViewInit(): void {
        if (this.autosaveService.wantsToContinue) {
            this.autosaveService.restoreCurrentDrawing();
            this.continueDrawingFromAutosave();
            this.drawingService.addInEditStack();
            this.autosaveService.wantsToContinue = false;
        } else {
            this.initNewDrawing();
        }
    }

    private initNewDrawing(): void {
        this.initCommonProperties();
        const savedCanva = this.drawingService.baseCtx.getImageData(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        this.drawingService.ctxStack.push(savedCanva);
        this.drawingService.canvasSizeStack.push({ x: this.baseCanvas.nativeElement.width, y: this.baseCanvas.nativeElement.height });
        this.baseCtx.fillStyle = 'white';
        this.baseCtx.fillRect(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
        this.autosaveService.saveCurrentDrawing();
    }

    private continueDrawingFromAutosave(): void {
        this.initCommonProperties();
        this.drawingService.canvasSizeStack.push({ x: this.baseCanvas.nativeElement.width, y: this.baseCanvas.nativeElement.height });
        this.autosaveService.saveCurrentDrawing();
    }

    private initCommonProperties(): void {
        this.drawingService.baseCanvas = this.baseCanvas.nativeElement;
        this.drawingService.previewCanvas = this.previewCanvas.nativeElement;
        this.drawingService.baseCtx = this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.previewCtx = this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.isToolInUse = false;
        this.drawingService.clearEditStack();
        this.eyedropperService.mainCanvas = this.baseCanvas.nativeElement;
        this.initGrabberElements();
        this.initCanvasSize();
        this.initGrabberPositions();
        this.setGrabberPositions();
        this.canvasResizerService.grabberMoveEmitter.subscribe((offsetGrabberCouple: OffsetGrabberCouple) => {
            this.resizeCanvas(offsetGrabberCouple.offset, offsetGrabberCouple.grabber);
        });
    }

    private initGrabberElements(): void {
        this.canvasResizerService.rightGrabberElement = this.rightGrabberElement = this.rightGrabberElementRef.nativeElement;
        this.canvasResizerService.bottomGrabberElement = this.bottomGrabberElement = this.bottomGrabberRef.nativeElement;
        this.canvasResizerService.cornerGrabberElement = this.cornerGrabberElement = this.cornerGrabberRef.nativeElement;
        this.undoRedoService.rightGrabberElement = this.rightGrabberElementRef.nativeElement;
        this.undoRedoService.bottomGrabberElement = this.bottomGrabberRef.nativeElement;
        this.undoRedoService.cornerGrabberElement = this.cornerGrabberRef.nativeElement;
    }

    private initCanvasSize(): void {
        if (!this.autosaveService.wantsToContinue) {
            this.previewCanvas.nativeElement.width = this.baseCanvas.nativeElement.width = this.canvasResizerService.computeCanvasSize(Side.Width);
            this.previewCanvas.nativeElement.height = this.baseCanvas.nativeElement.height = this.canvasResizerService.computeCanvasSize(Side.Height);
        } else {
            this.previewCanvas.nativeElement.width = this.baseCanvas.nativeElement.width = this.autosaveService.savedWidth;
            this.previewCanvas.nativeElement.height = this.baseCanvas.nativeElement.height = this.autosaveService.savedHeight;
        }
    }

    private initGrabberPositions(): void {
        this.rightGrabberPosition = this.canvasResizerService.computeRightGrabberPosition(
            this.baseCanvas.nativeElement.width,
            this.baseCanvas.nativeElement.height,
        );
        this.bottomGrabberPosition = this.canvasResizerService.computeBottomGrabberPosition(
            this.baseCanvas.nativeElement.width,
            this.baseCanvas.nativeElement.height,
        );
        this.cornerGrabberPosition = this.canvasResizerService.computeCornerGrabberPosition(
            this.baseCanvas.nativeElement.width,
            this.baseCanvas.nativeElement.height,
        );
    }

    private setGrabberPositions(): void {
        this.rightGrabberElement.style.top = `${this.rightGrabberPosition.y}px`;
        this.rightGrabberElement.style.left = `${this.rightGrabberPosition.x}px`;
        this.cornerGrabberElement.style.top = `${this.cornerGrabberPosition.y}px`;
        this.cornerGrabberElement.style.left = `${this.cornerGrabberPosition.x}px`;
        this.bottomGrabberElement.style.top = `${this.bottomGrabberPosition.y}px`;
        this.bottomGrabberElement.style.left = `${this.bottomGrabberPosition.x}px`;
    }

    private resizeCanvas(grabberOffset: Vec2, grabber: string): void {
        let imageData;
        switch (grabber) {
            case 'bottom-grabber':
                if (grabberOffset.y >= GRABBER_OFFSET1) {
                    imageData = this.baseCtx.getImageData(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
                    this.previewCanvas.nativeElement.height = this.baseCanvas.nativeElement.height = grabberOffset.y;
                    this.baseCtx.putImageData(imageData, 0, 0);
                    this.bottomGrabberElement.style.top = `${grabberOffset.y + GRABBER_OFFSET_3PX}px`;
                    this.cornerGrabberElement.style.top = `${grabberOffset.y - 1}px`;
                    this.rightGrabberElement.style.top = `${this.baseCanvas.nativeElement.height / 2 - GRABBER_OFFSET5}px`;
                }
                break;
            case 'right-grabber':
                if (grabberOffset.x >= GRABBER_OFFSET2) {
                    imageData = this.baseCtx.getImageData(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
                    this.previewCanvas.nativeElement.width = this.baseCanvas.nativeElement.width = grabberOffset.x - GRABBER_OFFSET4;
                    this.baseCtx.putImageData(imageData, 0, 0);
                    this.rightGrabberElement.style.left = `${grabberOffset.x - GRABBER_OFFSET3 + 2}px`;
                    this.cornerGrabberElement.style.left = `${grabberOffset.x - GRABBER_OFFSET4 - 1}px`;
                    this.bottomGrabberElement.style.left = `${this.baseCanvas.nativeElement.width / 2 - GRABBER_OFFSET5}px`;
                }
                break;
            case 'corner-grabber':
                if (grabberOffset.x >= GRABBER_OFFSET2 && grabberOffset.y >= GRABBER_OFFSET1) {
                    this.cornerGrabberElement.style.left = `${grabberOffset.x - GRABBER_OFFSET4 - 1}px`;
                    this.cornerGrabberElement.style.top = `${grabberOffset.y - 1}px`;
                    this.rightGrabberElement.style.left = `${grabberOffset.x - GRABBER_OFFSET3 + 2}px`;
                    this.rightGrabberElement.style.top = `${grabberOffset.y / 2 - GRABBER_OFFSET5}px`;
                    this.bottomGrabberElement.style.left = `${this.baseCanvas.nativeElement.width / 2 - GRABBER_OFFSET5}px`;
                    this.bottomGrabberElement.style.top = `${grabberOffset.y + GRABBER_OFFSET_3PX}px`;
                    imageData = this.baseCtx.getImageData(0, 0, this.baseCanvas.nativeElement.width, this.baseCanvas.nativeElement.height);
                    this.previewCanvas.nativeElement.width = this.baseCanvas.nativeElement.width = grabberOffset.x - GRABBER_OFFSET4;
                    this.previewCanvas.nativeElement.height = this.baseCanvas.nativeElement.height = grabberOffset.y;
                    this.baseCtx.putImageData(imageData, 0, 0);
                }
                break;
            default:
                break;
        }
    }

    private repositionGrabbers(): void {
        this.rightGrabberElement.style.left = this.undoRedoService.rightGrabberElement.style.left;
        this.rightGrabberElement.style.top = this.undoRedoService.rightGrabberElement.style.top;
        this.bottomGrabberElement.style.left = this.undoRedoService.bottomGrabberElement.style.left;
        this.bottomGrabberElement.style.top = this.undoRedoService.bottomGrabberElement.style.top;
        this.cornerGrabberElement.style.left = this.undoRedoService.cornerGrabberElement.style.left;
        this.cornerGrabberElement.style.top = this.undoRedoService.cornerGrabberElement.style.top;
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        const element = (event.target as HTMLElement).nodeName;
        if (element === 'CANVAS') {
            this.toolManagerService.currentTool.onMouseDown(event);
            if (this.toolManagerService.currentTool.mouseDown) this.drawingService.isToolInUse = true;
        } else {
            this.previewCanvas.nativeElement.style.borderBottom = this.baseCanvas.nativeElement.style.borderBottom = '2px dashed black';
            this.previewCanvas.nativeElement.style.borderRight = this.baseCanvas.nativeElement.style.borderRight = '2px dashed black';
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.toolManagerService.currentTool.onMouseUp(event);
        this.previewCanvas.nativeElement.style.borderBottom = this.baseCanvas.nativeElement.style.borderBottom = '2px solid black';
        this.previewCanvas.nativeElement.style.borderRight = this.baseCanvas.nativeElement.style.borderRight = '2px solid black';
        this.undoRedoService.undoRedoCurrentTool(
            this.toolManagerService.currentTool.toolName !== ToolName.Line,
            this.baseCanvas.nativeElement.width,
            this.baseCanvas.nativeElement.height,
        );
        this.autosaveService.saveCurrentDrawing();
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const element = (event.target as HTMLElement).nodeName;
        if (element === 'CANVAS') {
            this.toolManagerService.currentTool.onMouseMove(event);
            if (this.toolManagerService.currentTool.mouseDown) this.drawingService.isToolInUse = true;
        }
    }

    @HostListener('document:keydown', ['$event'])
    onKeyPress(event: KeyboardEvent): void {
        if (this.toolManagerService.currentTool.toolName === ToolName.SelectionRectangle) {
            this.clipboardService.isEllipse = false;
            this.clipboardService.onKeyPress(event);
        } else if (this.toolManagerService.currentTool.toolName === ToolName.SelectionEllipse) {
            this.clipboardService.isEllipse = true;
            this.clipboardService.onKeyPress(event);
        } else this.toolManagerService.currentTool.onKeyPress(event);
    }

    @HostListener('document:keyup', ['$event'])
    onKeyRelease(event: KeyboardEvent): void {
        this.toolManagerService.currentTool.onKeyRelease(event);
    }

    @HostListener('dblclick', ['$event'])
    onDoubleClick(event: MouseEvent): void {
        this.toolManagerService.currentTool.onDoubleClick(event);
        this.undoRedoService.undoRedoCurrentTool(
            this.toolManagerService.currentTool.toolName === ToolName.Line,
            this.baseCanvas.nativeElement.width,
            this.baseCanvas.nativeElement.height,
        );
        this.autosaveService.saveCurrentDrawing();
    }

    @HostListener('mousewheel', ['$event'])
    onMouseWheel(event: WheelEvent): void {
        this.toolManagerService.currentTool.onMouseWheel(event);
        this.autosaveService.saveCurrentDrawing();
    }

    @HostListener('document:keydown.control.z', ['$event'])
    onUndoKeyEvent(): void {
        this.undoRedoService.undo();
        this.repositionGrabbers();
    }

    @HostListener('document:keydown.control.shift.z', ['$event'])
    onRedoKeyEvent(): void {
        this.undoRedoService.redo();
        this.repositionGrabbers();
    }
}
