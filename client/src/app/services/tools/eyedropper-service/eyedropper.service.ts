import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const MAX_PIXEL_COLOR_CONCENTRATION = 255;
const SIXTH_DIGIT = 6;

@Injectable({
    providedIn: 'root',
})
export class EyedropperService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.Eyedropper;
    currentColor: string = 'FFFFFFFF';
    currentPrimaryColor: string = '000000ff';
    currentSecondaryColor: string = '000000ff';
    isRightClick: boolean = false;
    isLeftClick: boolean = false;
    isCanvas: boolean = false;
    miniCanvas: HTMLCanvasElement;
    mainCanvas: HTMLCanvasElement;
    isCircleVisible: boolean = false;

    setCurrentPrimaryColor(color: string): void {
        this.currentPrimaryColor = color;
    }

    setCurrentSecondaryColor(color: string): void {
        this.currentSecondaryColor = color;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left || event.button === MouseButton.Right;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            if (event.button === MouseButton.Right) {
                this.isLeftClick = false;
                this.isRightClick = true;
            } else {
                this.isRightClick = false;
            }
            if (event.button === MouseButton.Left) {
                this.isLeftClick = true;
                this.isRightClick = false;
            } else {
                this.isLeftClick = false;
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.isRightClick = false;
        this.isLeftClick = false;
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectPixelColor(this.drawingService.baseCtx, this.getPositionFromMouse(event));
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.isRightClick = false;
        this.isLeftClick = false;
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
        this.selectPixelColor(this.drawingService.baseCtx, this.getPositionFromMouse(event));
    }

    private selectPixelColor(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        const x = mousePosition.x;
        const y = mousePosition.y;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const colorHexFormat = '#' + ('000000' + this.rgbToHex(pixel[0], pixel[1], pixel[2])).slice(-SIXTH_DIGIT);
        this.currentColor = colorHexFormat;
        this.currentSecondaryColor = this.currentPrimaryColor = colorHexFormat;
    }

    private rgbToHex(r: number, g: number, b: number): string {
        if (r > MAX_PIXEL_COLOR_CONCENTRATION || g > MAX_PIXEL_COLOR_CONCENTRATION || b > MAX_PIXEL_COLOR_CONCENTRATION)
            throw new Error('Invalid color component');
        // Justification : après avoir fouillé le web nous n'avons pas trouvé de solution rapidement implémentable
        // pour se débarasser de ce tslint:disable
        // tslint:disable-next-line: no-bitwise
        return ((r << 16) | (g << 8) | b).toString(16);
    }
}
