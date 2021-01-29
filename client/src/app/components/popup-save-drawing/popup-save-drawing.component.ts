import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '@classes/my-error-state-matcher';
import { DrawingData } from '@common/communication/drawing-data';
import { ExportFormat } from '@common/communication/export-format';
import { InsertionStatus } from '@common/communication/insertion-status';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { DatabaseService } from '@services/database/database.service';
import { DrawingService } from '@services/drawing/drawing.service';

const TAG_NAME_MAX_LENGTH = 9;
const TITLE_NAME_MAX_LENGTH = 15;
const TAG_MAX_QUANTITY = 8;
@Component({
    selector: 'app-popup-save-drawing',
    templateUrl: './popup-save-drawing.component.html',
    styleUrls: ['./popup-save-drawing.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class PopupSaveDrawingComponent {
    constructor(
        private drawingService: DrawingService,
        private databaseService: DatabaseService,
        private saveDialogRef: MatDialogRef<PopupSaveDrawingComponent>,
        private dialog: MatDialog,
    ) {}

    @ViewChild('titleInput', { static: true }) titleInput: ElementRef;
    isDisabled: boolean = false;
    isPNG: boolean = false;
    tagFormControl: FormControl = new FormControl('', [Validators.maxLength(TAG_NAME_MAX_LENGTH), Validators.pattern('^[a-zA-Z0-9]*$')]);
    titleFormControl: FormControl = new FormControl('', [
        Validators.maxLength(TITLE_NAME_MAX_LENGTH),
        Validators.pattern('^[a-zA-Z0-9 ]*$'),
        Validators.required,
    ]);
    showSpinner: boolean = false;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    tags: string[] = [];
    matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

    private checkTag(): boolean {
        return this.tags.length < TAG_MAX_QUANTITY && !this.tagFormControl.hasError('maxlength') && !this.tagFormControl.hasError('pattern');
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim() && this.checkTag()) this.tags.push(value.trim());

        if (input) input.value = '';
    }

    setPNG(checked: boolean): void {
        this.isPNG = checked;
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    isDisabledDialog(): boolean {
        return (
            this.titleFormControl.hasError('required') ||
            this.tagFormControl.hasError('maxlength') ||
            this.tagFormControl.hasError('pattern') ||
            this.titleFormControl.hasError('maxlength') ||
            this.titleFormControl.hasError('pattern') ||
            this.isDisabled
        );
    }

    canvasToImage(): string {
        const context = this.drawingService.baseCtx;
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;

        let data;
        data = context.getImageData(0, 0, width, height);
        const compositeOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = 'destination-over';
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        const imageData = canvas.toDataURL('image/png');
        context.clearRect(0, 0, width, height);
        context.putImageData(data, 0, 0);
        context.globalCompositeOperation = compositeOperation;
        return imageData;
    }

    cancel(): void {
        this.isDisabled = false;
    }

    saveDrawing(): void {
        const confirmSave = confirm('Êtes-vous certain de vouloir sauvegarder votre dessin ?');
        if (confirmSave) {
            this.showSpinner = true;
            this.isDisabled = true;
            const currentID = Date.now();
            const newDrawingData: DrawingData = {
                id: currentID,
                title: this.titleInput.nativeElement.value,
                tags: this.tags,
                imageData: this.canvasToImage(),
                exportFormat: this.isPNG ? ExportFormat.PNG : ExportFormat.JPG,
            };
            this.databaseService.basicPost(newDrawingData).subscribe({
                next: (caught) => {
                    this.showSpinner = false;
                    if (caught.body === InsertionStatus.Inserted) {
                        this.dialog.open(ResponseMessageComponent, { data: 'Votre dessin a été inséré dans la base de données.' });
                    } else if (caught.body === InsertionStatus.savedAsPNGAndInserted) {
                        this.dialog.open(ResponseMessageComponent, {
                            data: 'Votre dessin a été exporté au format PNG dans le dossier server/drawings et inséré dans la base de données.',
                        });
                    }
                    this.isDisabled = false;
                    this.saveDialogRef.close();
                },
                error: (err) => {
                    this.showSpinner = false;

                    switch (err.error.body) {
                        case InsertionStatus.DatabaseError:
                            this.dialog.open(ResponseMessageComponent, {
                                data: 'Erreur de la base de données à distance.',
                            });
                            break;

                        case InsertionStatus.NotInserted:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Votre dessin n'a pas été inséré dans la base de données.",
                            });
                            break;

                        case InsertionStatus.InvalidRequest:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Le format de votre dessin n'est pas valide.",
                            });
                            break;
                        case InsertionStatus.WriteError:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Votre dessin n'a pas pu être exporté localement.",
                            });

                        default:
                            if (err.status === 0) {
                                this.dialog.open(ResponseMessageComponent, {
                                    data: 'Connexion au serveur refusée.',
                                });
                            }
                            break;
                    }
                    this.isDisabled = false;
                },
            });
        }
    }
}
