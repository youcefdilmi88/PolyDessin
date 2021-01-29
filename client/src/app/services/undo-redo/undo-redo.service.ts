import { Injectable } from '@angular/core';
import { Vec2 } from '@classes/vec2';
import { DrawingService } from '@services/drawing/drawing.service';

const GRABBER_OFFSET5 = 50;

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    constructor(public drawingService: DrawingService) {}

    rightGrabberElement: HTMLElement;
    bottomGrabberElement: HTMLElement;
    cornerGrabberElement: HTMLElement;

    undo(): void {
        this.drawingService.isStackEmpty = false;
        if (this.stackUndoEmptyStatus()) return;
        const canvasSize = this.getLastCanvaSizeFromUndoStack();
        this.eraseLastCtxFromUndoStack(canvasSize);
        this.drawingService.isStackEmptyRedo = false;
        this.stackUndoEmptyStatus();
    }

    redo(): void {
        this.drawingService.isStackEmptyRedo = false;
        if (this.stackRedoEmptyStatus()) return;
        if (this.drawingService.ctxStackRedo.length > 0) {
            const canvasSize = this.getLastCanvaSizeFromRedoStack();
            this.eraseLastCtxFromRedoStack(canvasSize);
            this.drawingService.isStackEmpty = false;
            this.stackRedoEmptyStatus();
        }
    }

    private getLastCanvaSizeFromUndoStack(): Vec2 {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const canvasSize = this.drawingService.canvasSizeStack[this.drawingService.canvasSizeStack.length - 2];
        this.drawingService.canvasSizeStackRedo.push(canvasSize);
        this.drawingService.canvasSizeStack.pop();

        this.cornerGrabberElement.style.left = `${canvasSize.x}px`;
        this.cornerGrabberElement.style.top = `${canvasSize.y}px`;
        this.rightGrabberElement.style.left = `${canvasSize.x}px`;
        this.rightGrabberElement.style.top = `${canvasSize.y / 2 - GRABBER_OFFSET5}px`;
        this.bottomGrabberElement.style.left = `${canvasSize.x / 2 - GRABBER_OFFSET5}px`;
        this.bottomGrabberElement.style.top = `${canvasSize.y}px`;

        return canvasSize;
    }

    private eraseLastCtxFromUndoStack(canvasSize: Vec2): void {
        this.drawingService.baseCtx.canvas.width = this.drawingService.previewCtx.canvas.width = canvasSize.x;
        this.drawingService.baseCtx.canvas.height = this.drawingService.previewCtx.canvas.height = canvasSize.y;
        this.drawingService.baseCtx.putImageData(
            this.drawingService.ctxStack[this.drawingService.ctxStack.length - 2],
            0,
            0,
            0,
            0,
            canvasSize.x,
            canvasSize.y,
        );
        this.drawingService.ctxStackRedo.push(this.drawingService.ctxStack[this.drawingService.ctxStack.length - 1]);
        this.drawingService.isStackEmptyRedo = false;
        this.drawingService.ctxStack.pop();
    }

    private getLastCanvaSizeFromRedoStack(): Vec2 {
        let canvasSize: Vec2;
        if (this.drawingService.canvasSizeStackRedo.length >= 2)
            canvasSize = this.drawingService.canvasSizeStackRedo[this.drawingService.canvasSizeStackRedo.length - 2];
        else canvasSize = this.drawingService.canvasSizeStackRedo[this.drawingService.canvasSizeStackRedo.length - 1];
        this.drawingService.canvasSizeStack.push(canvasSize);
        this.drawingService.canvasSizeStackRedo.pop();

        this.cornerGrabberElement.style.left = `${canvasSize.x}px`;
        this.cornerGrabberElement.style.top = `${canvasSize.y}px`;
        this.rightGrabberElement.style.left = `${canvasSize.x}px`;
        this.rightGrabberElement.style.top = `${canvasSize.y / 2 - GRABBER_OFFSET5}px`;
        this.bottomGrabberElement.style.left = `${canvasSize.x / 2 - GRABBER_OFFSET5}px`;
        this.bottomGrabberElement.style.top = `${canvasSize.y}px`;

        return canvasSize;
    }

    private eraseLastCtxFromRedoStack(canvasSize: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawingService.baseCtx.canvas.width = this.drawingService.previewCtx.canvas.width = canvasSize.x;
        this.drawingService.baseCtx.canvas.height = this.drawingService.previewCtx.canvas.height = canvasSize.y;
        this.drawingService.baseCtx.putImageData(
            this.drawingService.ctxStackRedo[this.drawingService.ctxStackRedo.length - 1],
            0,
            0,
            0,
            0,
            canvasSize.x,
            canvasSize.y,
        );
        this.drawingService.ctxStack.push(this.drawingService.ctxStackRedo[this.drawingService.ctxStackRedo.length - 1]);
        this.drawingService.ctxStackRedo.pop();
    }

    private stackRedoEmptyStatus(): boolean {
        if (this.drawingService.ctxStackRedo.length === 0) {
            this.drawingService.isStackEmptyRedo = true;
            return true;
        }
        return false;
    }

    private stackUndoEmptyStatus(): boolean {
        if (this.drawingService.ctxStack.length <= 1) {
            this.drawingService.isStackEmpty = true;
            return true;
        }
        return false;
    }

    undoRedoCurrentTool(isToolLine: boolean, width: number, height: number): void {
        this.drawingService.isToolInUse = false;
        this.drawingService.ctxStackRedo.length = 0;
        this.drawingService.isStackEmptyRedo = true;
        if (isToolLine) {
            const savedCanva = this.drawingService.baseCtx.getImageData(0, 0, width, height);
            this.drawingService.ctxStack.push(savedCanva);
            this.drawingService.canvasSizeStack.push({ x: width, y: height });
        }
        this.drawingService.isStackEmpty = false;
    }
}
