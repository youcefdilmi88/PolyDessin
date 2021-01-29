/*
Code inspiré du tutoriel de Lukas Marx
Lien : https://malcoded.com/posts/angular-color-picker/
*/
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';

const COLORSTOP1 = 0.17;
const COLORSTOP2 = 0.34;
const COLORSTOP3 = 0.51;
const COLORSTOP4 = 0.68;
const COLORSTOP5 = 0.85;
const LINEWIDTH1 = 5;
const LINEWIDTH2 = 10;
@Component({
    selector: 'app-color-slider',
    templateUrl: './color-slider.component.html',
    styleUrls: ['./color-slider.component.scss'],
})
export class ColorSliderComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false })
    canvas: ElementRef<HTMLCanvasElement>;

    @Output()
    color: EventEmitter<string> = new EventEmitter();

    mouseDown: boolean = false;
    private ctx: CanvasRenderingContext2D;
    private selectedHeight: number;

    ngAfterViewInit(): void {
        this.draw();
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(evt: MouseEvent): void {
        this.mouseDown = false;
    }

    draw(): void {
        if (!this.ctx) {
            this.ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        }
        const width = this.canvas.nativeElement.width;
        const height = this.canvas.nativeElement.height;
        this.ctx.clearRect(0, 0, width, height);
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(COLORSTOP1, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(COLORSTOP2, 'rgba(0, 255, 0, 1)');
        gradient.addColorStop(COLORSTOP3, 'rgba(0, 255, 255, 1)');
        gradient.addColorStop(COLORSTOP4, 'rgba(0, 0, 255, 1)');
        gradient.addColorStop(COLORSTOP5, 'rgba(255, 0, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 1)');
        this.ctx.beginPath();
        this.ctx.rect(0, 0, width, height);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.closePath();
        if (this.selectedHeight) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = LINEWIDTH1;
            this.ctx.rect(0, this.selectedHeight - LINEWIDTH1, width, LINEWIDTH2);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    onMouseDown(evt: MouseEvent): void {
        this.mouseDown = true;
        this.selectedHeight = evt.offsetY;
        this.draw();
        this.emitColor(evt.offsetX, evt.offsetY);
    }

    onMouseMove(evt: MouseEvent): void {
        if (this.mouseDown) {
            this.selectedHeight = evt.offsetY;
            this.draw();
            this.emitColor(evt.offsetX, evt.offsetY);
        }
    }

    emitColor(x: number, y: number): void {
        const hexColor = this.getColorAtPosition(x, y);
        this.color.emit(hexColor);
    }

    getColorAtPosition(x: number, y: number): string {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return this.RGBToHex(imageData[0], imageData[1], imageData[2]);
    }

    RGBToHex(r: number, g: number, b: number): string {
        let red = r.toString(16);
        let green = g.toString(16);
        let blue = b.toString(16);

        if (red.length === 1) red = '0' + red;
        if (green.length === 1) green = '0' + green;
        if (blue.length === 1) blue = '0' + blue;

        return '#' + red + green + blue;
    }
}
