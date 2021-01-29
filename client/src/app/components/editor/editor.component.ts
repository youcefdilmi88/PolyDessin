import { AfterViewInit, Component, HostListener } from '@angular/core';
import { Vec2 } from '@classes/vec2';
import { CanvasResizerService } from '@services/canvas-resizer/canvas-resizer.service';
import { EyedropperService } from '@tools/eyedropper-service/eyedropper.service';

const SX = 3;
const SY = 4;
const SWIDTH = 5;
const SHEIGHT = 5;
const DX = 0;
const DY = 0;
const DWIDTH = 80;
const DHEIGHT = 80;
const MAX = 30;
const BORDER_CANVAS = 10;

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit {
    constructor(public canvasResizerService: CanvasResizerService, public eyedropperService: EyedropperService) {}

    currentColor: {};
    myCanvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    baseCanvas: HTMLCanvasElement;
    coords: Vec2;

    ngAfterViewInit(): void {
        this.myCanvas = this.eyedropperService.miniCanvas;
        this.baseCanvas = this.eyedropperService.mainCanvas;
        this.context = this.myCanvas.getContext('2d') as CanvasRenderingContext2D;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        this.canvasResizerService.onGrabberMove(event);
        const element = (event.target as HTMLElement).nodeName;
        if (element === 'CANVAS') {
            this.eyedropperService.isCanvas = true;
            this.eyedropperService.isCircleVisible = true;
            this.coords = this.eyedropperService.getPositionFromMouse(event);
            this.zoom(this.context, this.coords.x, this.coords.y);
        } else {
            this.eyedropperService.isCanvas = false;
            this.eyedropperService.isCircleVisible = false;
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.canvasResizerService.onGrabberUp(event);
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.canvasResizerService.onGrabberClick(event);
    }

    private zoom(ctx: CanvasRenderingContext2D, x: number, y: number): void {
        if (x > MAX && y > MAX) {
            ctx.drawImage(
                this.baseCanvas,
                Math.min(Math.max(0, x - SWIDTH), this.baseCanvas.width - BORDER_CANVAS) + SX,
                Math.min(Math.max(0, y - SWIDTH), this.baseCanvas.height - BORDER_CANVAS) + SY,
                SWIDTH,
                SHEIGHT,
                DX,
                DY,
                DWIDTH,
                DHEIGHT,
            );
        }
    }
}
