import { Injectable } from '@angular/core';
import { Vec2 } from '@classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCanvas: HTMLCanvasElement;
    previewCanvas: HTMLCanvasElement;
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    id: number = 0;
    editStack: number[] = [];
    ctxStack: ImageData[] = [];
    ctxStackRedo: ImageData[] = [];
    isStackEmpty: boolean = true;
    isStackEmptyRedo: boolean = true;
    canvasSizeStack: Vec2[] = [];
    canvasSizeStackRedo: Vec2[] = [];
    isToolInUse: boolean;

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
    }

    addInEditStack(): void {
        this.id++;
        this.editStack.push(this.id);
    }

    clearEditStack(): void {
        this.editStack = [];
        this.id = 0;
    }

    resetDrawingForAutosave(): void {
        this.isToolInUse = false;
        this.resetUndoRedoStacks();
        this.clearEditStack();
        this.clearCanvas(this.baseCtx);
        this.clearCanvas(this.previewCtx);
    }

    private resetUndoRedoStacks(): void {
        this.ctxStack = [];
        this.ctxStackRedo = [];
        this.isStackEmpty = true;
        this.isStackEmptyRedo = true;
        this.canvasSizeStack = [];
        this.canvasSizeStackRedo = [];
    }
}
