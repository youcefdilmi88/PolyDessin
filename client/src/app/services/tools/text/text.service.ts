import { Injectable } from '@angular/core';
import { MouseButton } from '@app/enums/mouse-button';
import { TextFunctionService } from '@app/services/tools/text/text-function.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DrawingService } from '@services/drawing/drawing.service';

const OFFSET1 = -1;
@Injectable({
    providedIn: 'root',
})
export class TextService extends TextFunctionService {
    constructor(public drawingService: DrawingService, public undoService: UndoRedoService) {
        super(drawingService, undoService);
    }

    inTxtZone: boolean;

    setCurrentFont(font: string): void {
        this.currentFont = font;
        this.render(this.drawingService.baseCtx);
    }

    setCurrentFontSize(size: string): void {
        this.currentFontSize = size;
        this.render(this.drawingService.baseCtx);
    }

    setCurrentBold(status: boolean): void {
        this.currentBoldStatus = status;
        this.render(this.drawingService.baseCtx);
    }

    setCurrentItalic(status: boolean): void {
        this.currentItalicStatus = status;
        this.render(this.drawingService.baseCtx);
    }

    setCurrentAlignment(alignment: string, status: boolean): void {
        this.currentAlignmentRight = alignment === 'right' ? status : !status;
        this.currentAlignmentLeft = alignment === 'left' ? status : !status;
        this.currentAlignmentCenter = alignment === 'center' ? status : !status;
        this.render(this.drawingService.baseCtx);
    }

    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Meta' || event.key === 'Control') this.isCommandKey = true;
        if (this.isFocus) event.preventDefault();
        if (this.isCommandKey && event.key === 'a') {
            this.selected = true;
            this.render(this.drawingService.baseCtx);
            return;
        }
        this.keyBackspace(event);
        this.keyDelete(event);
        if (this.focusIndexLvl !== 0 || this.focusIndex > 0) this.keyArrowLeft(event);
        this.keyArrowRight(event);
        this.keyEnter(event);
        this.onKeyEscape(event);
        if ((!this.isCommandKey && event.key.length === 1) || (event.key.length > 1 && /[^a-zA-Z0-9]/.test(event.key))) {
            this.incrementWidth += this.textLenght >= this.threshold ? this.incWidth : 0;
            if (this.textString.length === this.focusIndex) {
                this.textString += event.key;
                this.focusIndex = this.textString.length;
            } else {
                this.textString = this.textString.slice(0, this.focusIndex) + event.key + this.textString.slice(this.focusIndex);
                this.focusIndex += 1;
            }
            this.render(this.drawingService.baseCtx);
        }
    }

    private keyEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.focusIndex = 0;
            this.enterHeight += this.incHeight;
            this.focusIndexLvl++;
            this.tmpLvl = 0;

            this.textStack.push(this.textString);
            this.tempSatck = this.textStack;

            this.textString = '';
            this.render(this.drawingService.baseCtx);
        }
    }

    private keyArrowRight(event: KeyboardEvent): void {
        if (event.key === 'ArrowRight') {
            this.focusIndex++;

            if (this.focusIndex >= this.textString.length && this.focusIndexLvl >= this.textStack.length - 1)
                this.focusIndex = this.textString.length;
            else if (this.textStack.length > 1 && this.focusIndex === this.textString.length) {
                this.enterHeight += this.incHeight;
                this.focusIndexLvl++;
                this.textString = this.textStack[this.focusIndexLvl];
                this.textStack[this.focusIndexLvl] = this.textStack[this.focusIndexLvl];
                if (this.focusIndexLvl !== this.textStack.length)
                    this.textStack[this.focusIndexLvl - 1] = this.textStack[this.focusIndexLvl - 1].slice(0, OFFSET1);
                this.focusIndex = 0;
            }

            this.render(this.drawingService.baseCtx);
        }
    }

    private keyArrowLeft(event: KeyboardEvent): void {
        if (event.key === 'ArrowLeft') {
            this.focusIndex--;
            if (this.textStack.length > 1 && this.focusIndex < 0) {
                this.enterHeight -= this.incHeight;
                this.focusIndexLvl--;
                this.tmpLvl++;
                this.textString = this.textStack[this.focusIndexLvl];
                this.textStack[this.focusIndexLvl] = this.textStack[this.focusIndexLvl].slice(0, OFFSET1);
                this.textStack[this.focusIndexLvl + 1] = this.textStack[this.focusIndexLvl + 1].substring(1);
                this.focusIndex = this.textStack[this.focusIndexLvl].length;
            }

            if (this.focusIndex < 0) this.focusIndex = 0;
            this.render(this.drawingService.baseCtx);
        }
    }

    private keyBackspace(event: KeyboardEvent): void {
        if (event.key === 'Backspace') {
            if (this.textStack.length > 1 && this.focusIndex - 1 === 0) {
                this.enterHeight -= this.incHeight;
                const currentTextLengt = this.textString.length - 1;
                const currentText = this.textString.substring(1);
                this.textString = this.textStack[this.textStack.length - 2].slice(0, OFFSET1) + '  ' + currentText;
                this.focusIndex = this.textString.length - currentTextLengt - 1;
                this.focusIndexLvl--;
                this.textStack.pop();
            }
            if (this.textStack.length > 1 && this.focusIndex === 0) {
                this.enterHeight -= this.incHeight;
                const currentTextLengt = this.textString.length;
                const currentText = this.textString;
                this.textString = this.textStack[this.textStack.length - 2] + ' ' + currentText;
                this.focusIndex = this.textString.length - currentTextLengt - 1;
                this.focusIndexLvl--;
                this.textStack.pop();
            }

            let str = '';
            for (let i = 0; i < this.textString.length; i++) {
                if (i !== this.focusIndex - 1) {
                    if (this.textString !== ' ') str += this.textString[i];
                }
            }

            this.textString = str;

            if (this.focusIndexLvl <= 0) this.focusIndexLvl = 0;
            this.focusIndex--;
            if (this.focusIndex < 0) this.focusIndex = 0;

            this.render(this.drawingService.baseCtx);
        }
    }
    private keyDelete(event: KeyboardEvent): void {
        if (event.key === 'Delete') {
            if (this.textStack.length > 1 && this.focusIndex === this.textString.length - 1) {
                const currentText = this.textString;
                if (this.focusIndexLvl < this.textStack.length - 2) {
                    this.textStack[this.focusIndexLvl + 1] = this.textStack[this.focusIndexLvl + 1].slice(0, OFFSET1);
                }
                this.textString = currentText + this.textStack[this.focusIndexLvl + 1] + ' ';
                this.textStack[this.focusIndexLvl] = this.textString;
                this.popIndex(this.focusIndexLvl + 1);
                this.focusIndex = currentText.length - 1;
            }

            let str = '';
            for (let i = 0; i < this.textString.length; i++) {
                if (i !== this.focusIndex) {
                    str += this.textString[i];
                }
            }

            this.textString = str;

            if (this.focusIndexLvl <= 0) {
                this.focusIndexLvl = 0;
            }
            this.render(this.drawingService.baseCtx);
        }
    }

    private popIndex(index: number): void {
        if (index > OFFSET1) {
            this.textStack.splice(index, 1);
        }
    }

    onKeyEscape(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.selected = false;
            this.isFocus = false;
            this.render(this.drawingService.baseCtx);
            for (let i = 0; i < this.inc; i++) {
                this.undoService.undo();
                this.drawingService.ctxStackRedo.pop();
            }
            this.undoService.undo();
            this.drawingService.ctxStackRedo.pop();
            this.textString = '';
            this.textLenght = 0;
            this.incrementWidth = 0;
            this.enterHeight = 0;
            this.inc = 0;
            this.textStack = [''];
            this.focusIndexLvl = 0;
            this.maxWidth = 0;
            this.maxHeight = 0;
            this.mousePosition = { x: 0, y: 0 };
            this.position = { x: 0, y: 0 };
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            const inTxtZoneX = this.mousePosition.x <= this.position.x + this.options.width && this.mousePosition.x >= this.position.x;
            const inTxtZoneY = this.mousePosition.y <= this.position.y + this.options.height && this.mousePosition.y >= this.position.y;
            this.inTxtZone = inTxtZoneX && inTxtZoneY;
            if (!this.inTxtZone) {
                if (this.isFocus) {
                    this.done();
                    return;
                } else {
                    this.selected = true;
                    this.isFocus = true;
                }
                this.text();
            } else this.inc++;

            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
        this.mouseDown = false;
        this.drawingService.addInEditStack();
    }

    onMouseMove(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
        }
    }
}
