import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { DrawingService } from '@services/drawing/drawing.service';
import { SelectionEllipseService } from '@tools/selection/selection-ellipse/selection-ellipse.service';
import { SelectionRectangleService } from '@tools/selection/selection-rectangle/selection-rectangle.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService extends DrawTool {
    constructor(
        drawingService: DrawingService,
        public selectionService: SelectionRectangleService,
        public selectionEllipse: SelectionEllipseService,
    ) {
        super(drawingService);
    }

    isEllipse: boolean = false;

    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Delete') {
            this.delete();
        }
        if (event.ctrlKey) {
            switch (event.key) {
                case 'c': // Keyboard.C
                    this.copy();
                    break;
                case 'v': // Keyboard.V
                    this.paste();
                    break;
                case 'x': // Keyboard.X
                    this.cut();
                    break;
            }
        }
    }
    delete(): void {
        if (this.isEllipse) this.deleteEllipse();
        else this.deleteRectangle();
    }
    copy(): void {
        if (this.isEllipse) this.copyEllipse();
        else this.copyRectangle();
    }
    paste(): void {
        if (this.isEllipse) this.pasteEllipse();
        else this.pasteRectangle();
    }
    cut(): void {
        if (this.isEllipse) this.cutEllipse();
        else this.cutRectangle();
    }

    private deleteRectangle(): void {
        this.selectionService.clearSelection(this.drawingService.baseCtx);
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private cutRectangle(): void {
        this.selectionService.clipboard = this.selectionService.selectionData;
        this.selectionService.clearSelection(this.drawingService.baseCtx);
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private copyRectangle(): void {
        this.selectionService.clipboard = this.selectionService.selectionData;
    }

    private pasteRectangle(): void {
        this.selectionService.selectionMouseDown = { x: this.selectionService.selectionMiddle.x, y: this.selectionService.selectionMiddle.y };
        if (this.selectionService.clipboard !== undefined) {
            this.selectionService.selectionData = this.selectionService.clipboard;
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectionService.selectionMiddle.x = this.selectionService.selectionWidth / 2;
            this.selectionService.selectionMiddle.y = this.selectionService.selectionHeight / 2;
            this.selectionService.drawSelection(this.drawingService.baseCtx, {
                x: this.selectionService.selectionMiddle.x,
                y: this.selectionService.selectionMiddle.y,
            });
            this.selectionService.newPoint.x = this.selectionService.newPoint.y = 0;
            this.selectionService.drawBox(this.drawingService.previewCtx, { x: 0, y: 0 });
            this.selectionService.saveSelection();
        }
    }

    private deleteEllipse(): void {
        this.selectionEllipse.clearSelection(this.drawingService.baseCtx);
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private cutEllipse(): void {
        this.selectionEllipse.clipboard = this.selectionEllipse.selectionData;
        this.selectionEllipse.clearSelection(this.drawingService.baseCtx);
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    private copyEllipse(): void {
        this.selectionEllipse.clipboard = this.selectionEllipse.selectionData;
    }

    private pasteEllipse(): void {
        this.selectionEllipse.selectionMouseDown = { x: this.selectionEllipse.selectionMiddle.x, y: this.selectionEllipse.selectionMiddle.y };
        if (this.selectionEllipse.clipboard !== undefined) {
            this.selectionEllipse.selectionData = this.selectionEllipse.clipboard;
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.selectionEllipse.selectionMiddle.x = this.selectionEllipse.selectionWidth / 2;
            this.selectionEllipse.selectionMiddle.y = this.selectionEllipse.selectionHeight / 2;
            this.selectionEllipse.drawSelection(this.drawingService.baseCtx, {
                x: this.selectionEllipse.selectionMiddle.x,
                y: this.selectionEllipse.selectionMiddle.y,
            });
            this.selectionEllipse.newPoint.x = this.selectionEllipse.newPoint.y = 0;
            this.selectionEllipse.drawBox(this.drawingService.previewCtx, { x: 0, y: 0 });
            this.selectionEllipse.saveSelection();
        }
    }
}
