import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderChange } from '@angular/material/slider';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';

const MAX_ARRAY = 100;
const SUBSTRING = 7;
const COLOR_LENGTH = 9;
const HISTORY_LENGTH = 10;

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent {
    constructor(public dialog: MatDialog) {}

    @Output() colorOutput: EventEmitter<string> = new EventEmitter<string>();
    @Output() alphaOutput: EventEmitter<number> = new EventEmitter<number>();
    hue: string;
    color: string = '#000000';
    private opacity: number = 100;
    savedColors: string[] = ['#000000ff'];

    saveColor(event: KeyboardEvent): void {
        const isHexColor = /^#[0-9A-F]{6}$/i.test((event.target as HTMLInputElement).value);
        if (isHexColor) {
            this.color = (event.target as HTMLInputElement).value += this.alphaToHex(this.opacity);
            this.saveColorInHistory(this.color);
            this.colorOutput.emit(this.color);
        } else {
            this.dialog.open(ResponseMessageComponent, {
                data: 'Le format de la couleur est invalide, veuillez utiliser le format hexadécimal #xxxxxx',
            });
        }
    }

    private saveColorInHistory(color: string): void {
        if (!this.savedColors.includes(color)) {
            if (this.savedColors.length >= HISTORY_LENGTH) {
                this.savedColors.shift();
            }
            this.savedColors.push(color);
        }
    }

    selectFromHistory(color: string): void {
        this.colorOutput.emit(color);
    }

    onColorChange(event: string): void {
        this.color = event;
        if (this.color.length === COLOR_LENGTH) {
            this.color = this.color.substring(0, SUBSTRING);
        }
        this.color += this.alphaToHex(this.opacity);
        this.saveColorInHistory(this.color);
        this.colorOutput.emit(this.color);
    }

    onHueChange(event: string): void {
        this.hue = event;
        if (this.color.length > SUBSTRING) {
            this.color = this.color.substring(0, SUBSTRING);
        }
        this.color += this.alphaToHex(this.opacity);
        this.saveColorInHistory(this.color);
        this.colorOutput.emit(this.color);
    }

    onOpacityChange(event: MatSliderChange): void {
        this.opacity = event.value ? event.value : 0;
        if (this.color.length > SUBSTRING) {
            this.color = this.color.substring(0, SUBSTRING);
        }
        this.color += this.alphaToHex(this.opacity);
        this.alphaOutput.emit(this.opacity / MAX_ARRAY);
        this.saveColorInHistory(this.color);
        this.colorOutput.emit(this.color);
    }

    alphaToHex(alpha: number): string {
        return alpha > 0 ? Math.floor((alpha / 100) * 255).toString(16) : '00';
    }
}
