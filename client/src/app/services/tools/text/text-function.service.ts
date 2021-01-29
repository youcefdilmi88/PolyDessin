import { Injectable } from '@angular/core';
import { OptionsTextFunction } from '@app/classes/options-text-function';
import { DrawTool } from '@classes/draw-tool';
import { Vec2 } from '@classes/vec2';
import { fontSize } from '@enums/text-size';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';
import { UndoRedoService } from '@services/undo-redo/undo-redo.service';

const BOX_WIDTH = 350;
const BOX_HEIGHT = 100;
const BOX_HEIGHT2 = 40;
const PAD = 5;
const POS = 10;
const THRESH_HOLD = 320;
const THRESH_HOLD2 = 340;
const OFFSET1 = -1;

@Injectable({
    providedIn: 'root',
})
export class TextFunctionService extends DrawTool {
    fonts: string[] = [
        'Arial',
        'Times New Roman',
        'Agency FB',
        'Verdana',
        'Algerian',
        'Comic Sans MS',
        'Lucida Sans Unicode',
        'Bradley Hand ITC',
        'Courier',
        'Edwardian Script ITC',
        'Chiller',
    ];

    size: string[] = ['14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];
    heightDictionnary: Map<string, number> = new Map<string, number>();
    widthDictionnary: Map<string, number> = new Map<string, number>();

    constructor(public drawingService: DrawingService, public undoService: UndoRedoService) {
        super(drawingService);
    }

    toolName: ToolName = ToolName.Text;
    protected textStack: string[] = [''];
    protected textString: string = '';
    protected textLenght: number = 0;
    protected position: Vec2 = { x: POS, y: POS };
    protected isFocus: boolean = false;
    protected focusIndex: number = this.textString.length;
    protected focusIndexLvl: number = 0;
    protected tmpLvl: number = 0;
    protected isCommandKey: boolean = false;
    protected selected: boolean = false;
    protected currentBoldStatus: boolean = false;
    protected currentItalicStatus: boolean = false;
    protected currentFont: string = 'Arial';
    protected currentFontSize: string = '26';
    private font: string = this.currentFontSize + 'px ' + this.currentFont;
    private boxWidth: number = BOX_WIDTH;
    private textBoxWidth: number = BOX_WIDTH;
    protected textBoxHeight: number = BOX_HEIGHT;
    protected borderWidth: number = 1;
    protected borderColor: string = '#ccc';
    private padding: number = PAD;
    currentAlignmentRight: boolean = false;
    currentAlignmentCenter: boolean = false;
    currentAlignmentLeft: boolean = true;
    private textAlign: CanvasTextAlign = 'center';
    protected enterHeight: number = 0;
    protected incHeight: number = 0;
    protected incWidth: number = 0;
    protected incrementWidth: number = 0;
    protected threshold: number = THRESH_HOLD;
    protected maxHeight: number = 0;
    protected maxWidth: number = 0;
    inc: number = 0;
    protected tempSatck: string[] = [];

    protected options: OptionsTextFunction = {
        width: BOX_WIDTH,
        height: BOX_HEIGHT2,
        font: this.font,
        borderWidth: 0.5,
        borderColor: 'fff',
        padding: PAD,
    };

    private initializeAttributes(): void {
        this.heightDictionnary
            .set('14', fontSize.BoxSizeForFont14)
            .set('16', fontSize.BoxSizeForFont16)
            .set('18', fontSize.BoxSizeForFont18)
            .set('20', fontSize.BoxSizeForFont20)
            .set('22', fontSize.BoxSizeForFont22)
            .set('24', fontSize.BoxSizeForFont24)
            .set('26', fontSize.BoxSizeForFont26)
            .set('28', fontSize.BoxSizeForFont28)
            .set('36', fontSize.BoxSizeForFont36)
            .set('48', fontSize.BoxSizeForFont48)
            .set('72', fontSize.BoxSizeForFont72);

        let strBoldItalic = '';
        strBoldItalic += this.currentBoldStatus ? 'bold ' : '';
        strBoldItalic += this.currentItalicStatus ? 'italic ' : '';
        this.font = strBoldItalic + this.currentFontSize + 'px ' + this.currentFont;

        this.textAlign = this.currentAlignmentCenter ? 'center' : this.currentAlignmentLeft ? 'left' : 'right';
        this.boxWidth = this.currentAlignmentCenter
            ? this.textBoxWidth / 2
            : this.currentAlignmentLeft
            ? this.options.padding
            : this.textBoxWidth - 2 * this.options.padding;
        this.options = Object.assign({ width: BOX_WIDTH, height: BOX_HEIGHT, font: this.font, borderWidth: 0.5, borderColor: '#fff', padding: PAD });
    }

    private getHeightIncrement(sizeOfFont: string): void {
        const size = this.heightDictionnary.get(sizeOfFont);
        if (size) {
            this.incHeight = size;
            this.incWidth = size / 2;
            this.threshold = THRESH_HOLD2 - this.incWidth;
        } else {
            this.incHeight = fontSize.BoxSizeForFont14;
            this.incWidth = POS;
        }
    }

    done(): void {
        this.selected = false;
        this.isFocus = false;
        this.render(this.drawingService.baseCtx);
        for (let i = 0; i < this.inc; i++) {
            this.undoService.undo();
            this.drawingService.ctxStackRedo.pop();
        }
        this.undoService.undo();
        this.drawingService.ctxStackRedo.pop();
        this.textStack[this.textStack.length - 1] = this.textStack[this.textStack.length - 1].slice(0, OFFSET1);
        this.writeTexte(this.drawingService.baseCtx);
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

    protected text(): void {
        this.position = this.mousePosition;
        this.render(this.drawingService.baseCtx);
    }

    private updateText(): void {
        if (this.textStack.length <= 1) {
            this.textStack[0] = this.textString;
        } else {
            this.textStack[this.focusIndexLvl] = this.textString;
        }
    }

    protected render(ctx: CanvasRenderingContext2D): void {
        this.getHeightIncrement(this.currentFontSize);
        this.initializeAttributes();
        this.updateText();
        this.maxBoxSize();
        ctx.lineWidth = this.options.borderWidth;
        ctx.strokeStyle = this.options.borderColor;

        if (this.isFocus) {
            ctx.strokeStyle = '#000';
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        this.drawBox(ctx);
        ctx.stroke();
        let str = '';
        const tmp = this.textStack[this.focusIndexLvl];
        // write text
        if (tmp.length >= 0) {
            for (let i = 0; i < tmp.length; i++) {
                if (this.focusIndex === i) {
                    str += '|';
                }
                str += tmp[i];
            }
            if (this.focusIndex === tmp.length) {
                str += '|';
            }
            this.textStack[this.focusIndexLvl] = str;
            if (tmp.length === 0) this.textStack[this.focusIndexLvl] = '|';
        }
        this.writeTexte(ctx);
    }

    private drawBox(ctx: CanvasRenderingContext2D): void {
        if (this.currentAlignmentLeft) {
            ctx.fillRect(
                this.position.x - this.padding,
                this.position.y - this.padding,
                this.options.width + this.maxWidth + this.padding * 2,
                this.options.height + this.maxHeight + this.padding * 2,
            );
            ctx.rect(this.position.x, this.position.y, this.options.width + this.incrementWidth, this.options.height + this.enterHeight);
        } else if (this.currentAlignmentRight) {
            ctx.fillRect(
                this.position.x - this.padding - this.incrementWidth,
                this.position.y - this.padding,
                this.options.width + this.maxWidth + this.padding * 2 + this.incrementWidth,
                this.options.height + this.maxHeight + this.padding * 2,
            );
            ctx.rect(
                this.position.x - this.incrementWidth,
                this.position.y,
                this.options.width + this.incrementWidth,
                this.options.height + this.enterHeight,
            );
        } else if (this.currentAlignmentCenter) {
            ctx.fillRect(
                this.position.x - this.padding - this.incrementWidth / 2,
                this.position.y - this.padding,
                this.options.width + this.maxWidth + this.padding * 2 + this.incrementWidth,
                this.options.height + this.maxHeight + this.padding * 2,
            );
            ctx.rect(
                this.position.x - this.incrementWidth / 2,
                this.position.y,
                this.options.width + this.incrementWidth,
                this.options.height + this.enterHeight,
            );
        }
    }

    private writeTexte(ctx: CanvasRenderingContext2D): void {
        ctx.font = this.options.font;
        ctx.textAlign = this.textAlign;
        ctx.fillStyle = this.currentPrimaryColor;
        let str = '';
        this.textLenght = ctx.measureText(this.textString).width;
        for (let i = 0; i < this.textStack.length; i++) {
            const height = this.incHeight * i;
            if (this.textStack.length > 1 && i !== this.textStack.length - 1) {
                str = this.textStack[i].slice(0, OFFSET1);
            } else str = this.textStack[i];

            ctx.fillText(
                str,
                this.position.x + this.boxWidth + this.options.padding,
                this.position.y + this.options.height / 2 + this.options.padding + height,
            );
        }
    }
    private maxBoxSize(): void {
        if (this.maxWidth < this.incrementWidth) this.maxWidth = this.incrementWidth;
        if (this.maxHeight < this.enterHeight) this.maxHeight = this.enterHeight;
    }
}
