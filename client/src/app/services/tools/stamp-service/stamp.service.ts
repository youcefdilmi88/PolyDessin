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
const SCALER = 10;

@Injectable({
    providedIn: 'root',
})
export class StampService extends DrawTool {
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.image.src = '../../../../assets/Stamp1.png';
    }
    toolName: ToolName = ToolName.Stamp;
    currentStamp: string = 'Étampe 1';
    currentStampScale: number;
    private image: HTMLImageElement = new Image();
    private width: number;
    private height: number;
    private mousePreviewPos: Vec2;
    stampAngle: BehaviorSubject<number> = new BehaviorSubject(this.currentStampAngle);

    initialiseScale(): void {
        this.currentStampScale = 1;
        this.updateScale();
    }

    setCurrentStamp(stamp: string): void {
        this.currentStamp = stamp;
        this.selectStamp();
    }

    setCurrentScale(scale: number): void {
        this.currentStampScale = scale;
        this.updateScale();
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'none';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawImageStamp(this.drawingService.baseCtx, this.mouseDownCoord);
        }
        this.drawingService.addInEditStack();
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'none';
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'none';
        this.mousePreviewPos = this.getPositionFromMouse(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawImageStamp(this.drawingService.previewCtx, this.mousePreviewPos);
    }

    onMouseWheel(event: WheelEvent): void {
        this.mousePreviewPos = this.getPositionFromMouse(event);
        const y = event.deltaY;
        if (y < 0) {
            // wheel up
            if (event.altKey) {
                this.currentStampAngle += 1;
            } else {
                this.currentStampAngle += ANGLE_15;
            }
        } else if (event.deltaY > 0) {
            // wheel down
            if (event.altKey) {
                this.currentStampAngle -= 1;
            } else {
                this.currentStampAngle -= ANGLE_15;
            }
        }
        const OFFSET = this.currentStampAngle > ANGLE_180 ? -ANGLE_360 : this.currentStampAngle < -ANGLE_180 ? ANGLE_360 : 0;
        this.currentStampAngle += OFFSET;
        this.stampAngle.next(this.currentStampAngle);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawImageStamp(this.drawingService.previewCtx, this.mousePreviewPos);
    }

    private drawImageStamp(ctx: CanvasRenderingContext2D, mousePosition: Vec2): void {
        ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        ctx.translate(mousePosition.x, mousePosition.y);
        ctx.rotate((Math.PI * this.currentStampAngle) / ANGLE_180);
        ctx.translate(-mousePosition.x, -mousePosition.y);
        ctx.drawImage(this.image, mousePosition.x - this.width / 2, mousePosition.y - this.height / 2, this.width, this.height);
        ctx.restore();
    }

    private updateScale(): number {
        this.width = (this.image.width * this.currentStampScale) / SCALER;
        this.height = (this.image.height * this.currentStampScale) / SCALER;
        return this.width && this.height;
    }

    private selectStamp(): void {
        switch (this.currentStamp) {
            case 'Étampe 2':
                this.image.src = '../../../../assets/Stamp2.png';
                break;
            case 'Étampe 3':
                this.image.src = '../../../../assets/Stamp3.png';
                break;
            case 'Étampe 4':
                this.image.src = '../../../../assets/Stamp4.png';
                break;
            case 'Étampe 5':
                this.image.src = '../../../../assets/Stamp5.png';
                break;
            default:
                this.image.src = '../../../../assets/Stamp1.png';
                break;
        }
    }
}
