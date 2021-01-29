import { Component, Injectable } from '@angular/core';
import { AutosaveService } from '@services/autosave/autosave.service';

@Component({
    selector: 'app-popup-new-drawing',
    templateUrl: './popup-new-drawing.component.html',
    styleUrls: ['./popup-new-drawing.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class PopupNewDrawingComponent {
    constructor(public autosaveService: AutosaveService) {}

    refresh(): void {
        this.autosaveService.deleteCurrentDrawing();
        window.location.reload();
    }
}
