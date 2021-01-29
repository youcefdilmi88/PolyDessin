import { Component } from '@angular/core';
import { DrawingService } from '@services/drawing/drawing.service';
import { ToolManagerService } from '@services/tool-manager/tool-manager.service';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
    constructor(public drawingService: DrawingService, public toolManagerService: ToolManagerService) {}

    verticalLineArray(): string[] {
        const nbLines = this.drawingService.baseCanvas.width / this.toolManagerService.currentGridSquareSize;
        const offsets: string[] = [];
        let offset = 0;
        for (let i = 0; i < Math.floor(nbLines); i++) {
            offsets.push(`${(offset += this.toolManagerService.currentGridSquareSize)}px`);
        }
        return offsets;
    }

    horizontalLineArray(): string[] {
        const nbLines = this.drawingService.baseCanvas.height / this.toolManagerService.currentGridSquareSize;
        const offsets: string[] = [];
        let offset = 0;
        for (let i = 0; i < Math.floor(nbLines); i++) {
            offsets.push(`${(offset += this.toolManagerService.currentGridSquareSize)}px`);
        }
        return offsets;
    }

    getHorizontalLineLength(): string {
        return `${this.drawingService.baseCanvas.width}px`;
    }

    getVerticalLineLength(): string {
        return `${this.drawingService.baseCanvas.height}px`;
    }

    getGridOpacity(): string {
        return `${this.toolManagerService.currentGridOpacity}%`;
    }
}
