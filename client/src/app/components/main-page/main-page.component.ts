import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrouselComponent } from '@components/carrousel/carrousel.component';
import { UserManualDialogComponent } from '@components/user-manual-dialog/user-manual-dialog.component';
import { AutosaveService } from '@services/autosave/autosave.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(public dialog: MatDialog, public autosaveService: AutosaveService) {}

    @ViewChild('createNewDrawingBtn', { static: false }) createNewDrawingBtn: ElementRef<HTMLButtonElement>;
    @ViewChild('continueDrawingBtn', { static: false }) continueDrawingBtn: ElementRef<HTMLButtonElement>;
    readonly title: string = 'PolyDessin 2';
    readonly drawingInProgressText: string = 'Il y a un dessin actuellement en cours';
    readonly noDrawingInProgressText: string = "Il n'y a pas de dessin en cours";
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');

    openUserManualDialog(): void {
        this.dialog.open(UserManualDialogComponent, {
            width: '1100px',
            height: '700px',
        });
    }

    openCarrouselDialog(): void {
        this.dialog.open(CarrouselComponent);
    }

    continueDrawing(): void {
        this.autosaveService.wantsToContinue = true;
    }
}
