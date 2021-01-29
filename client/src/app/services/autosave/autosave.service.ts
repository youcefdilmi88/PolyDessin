import { Injectable } from '@angular/core';
import { CanvasResizerService } from '@services/canvas-resizer/canvas-resizer.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { UndoRedoService } from '@services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class AutosaveService {
    constructor(public drawingService: DrawingService, public canvasResizerService: CanvasResizerService, public undoRedoService: UndoRedoService) {}
    drawingInProgress: boolean = false;
    drawingDataURL: string | null;
    savedWidth: number;
    savedHeight: number;
    wantsToContinue: boolean = false;

    isDrawingInProgress(): boolean {
        this.drawingDataURL = localStorage.getItem('dessin');

        if (this.drawingDataURL !== null) {
            this.drawingDataURL !== '' ? (this.drawingInProgress = true) : (this.drawingInProgress = false);
        }

        return this.drawingInProgress;
    }

    saveCurrentDrawing(): void {
        this.drawingDataURL = this.drawingService.baseCanvas.toDataURL('image/png');
        this.savedWidth = this.drawingService.baseCanvas.width;
        this.savedHeight = this.drawingService.baseCanvas.height;

        try {
            localStorage.setItem('dessin', this.drawingDataURL);
            localStorage.setItem('largeur', this.savedWidth.toString());
            localStorage.setItem('hauteur', this.savedHeight.toString());
        } catch (e) {
            console.log('Storage failed: ' + e);
        }

        this.drawingInProgress = true;
    }

    deleteCurrentDrawing(): void {
        this.drawingService.resetDrawingForAutosave();
        localStorage.clear();
        this.drawingDataURL = '';
        this.drawingInProgress = false;
        this.wantsToContinue = false;
    }

    restoreCurrentDrawing(): void {
        this.drawingService.resetDrawingForAutosave();

        this.drawingDataURL = localStorage.getItem('dessin') as string;
        this.savedWidth = (localStorage.getItem('largeur') as unknown) as number;
        this.savedHeight = (localStorage.getItem('hauteur') as unknown) as number;

        const img = new Image();
        img.onload = () => {
            this.drawingService.previewCanvas.width = this.drawingService.baseCanvas.width = this.savedWidth;
            this.drawingService.previewCanvas.height = this.drawingService.baseCanvas.height = this.savedHeight;
            this.drawingService.baseCtx.drawImage(img, 0, 0, this.savedWidth, this.savedHeight);
        };
        img.src = this.drawingDataURL;
    }
}
