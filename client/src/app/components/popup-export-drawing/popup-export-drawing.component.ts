import { AfterViewInit, Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '@classes/my-error-state-matcher';
import { DrawingData } from '@common/communication/drawing-data';
import { ExportFormat } from '@common/communication/export-format';
import { ExportStatus } from '@common/communication/export-status';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { DatabaseService } from '@services/database/database.service';
import { DrawingService } from '@services/drawing/drawing.service';

const TITLE_NAME_MAX_LENGTH = 15;

@Component({
    selector: 'app-popup-export-drawing',
    templateUrl: './popup-export-drawing.component.html',
    styleUrls: ['./popup-export-drawing.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class PopupExportDrawingComponent implements AfterViewInit {
    constructor(
        private drawingService: DrawingService,
        private databaseService: DatabaseService,
        private exportDialogRef: MatDialogRef<PopupExportDrawingComponent>,
        private dialog: MatDialog,
    ) {}

    @ViewChild('imagePreview', { static: false }) imagePreview: ElementRef<HTMLImageElement>;
    @ViewChild('titleInput', { static: true }) titleInput: ElementRef;
    currentFilter: string = '';
    isDisabled: boolean = false;
    exportFormat: ExportFormat = ExportFormat.JPG;
    showSpinner: boolean = false;
    titleFormControl: FormControl = new FormControl('', [
        Validators.maxLength(TITLE_NAME_MAX_LENGTH),
        Validators.pattern('^[a-zA-Z0-9 ]*$'),
        Validators.required,
    ]);
    matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

    ngAfterViewInit(): void {
        this.imagePreview.nativeElement.src = this.canvasToImage();
    }

    selectFormat(event: MatButtonToggleChange): void {
        this.exportFormat = event.value === 'jpg' ? ExportFormat.JPG : ExportFormat.PNG;
    }

    cancel(): void {
        this.isDisabled = false;
    }

    isDisabledDialog(): boolean {
        return (
            this.titleFormControl.hasError('required') ||
            this.titleFormControl.hasError('maxlength') ||
            this.titleFormControl.hasError('pattern') ||
            this.isDisabled
        );
    }

    // Methode inspirée de stackOverflow
    /*https://stackoverflow.com/questions/32160098/
    change-html-canvas-black-background-to-white-background-when-creating-jpg-image*/
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
        context.globalCompositeOperation = compositeOperation;
        context.filter = this.currentFilter;
        context.drawImage(canvas, 0, 0);
        const imageData = canvas.toDataURL(`image/${this.exportFormat === ExportFormat.JPG ? 'jpeg' : 'png'}`);
        context.clearRect(0, 0, width, height);
        context.putImageData(data, 0, 0);
        context.globalCompositeOperation = compositeOperation;
        context.filter = 'none';
        return imageData;
    }

    exportDrawing(): void {
        const confirmExport = confirm('Êtes-vous certain de vouloir exporter votre dessin ?');
        if (confirmExport) {
            this.showSpinner = true;
            this.isDisabled = true;
            const currentID = Date.now();

            const newDrawingData: DrawingData = {
                id: currentID,
                title: this.titleInput.nativeElement.value,
                tags: [],
                imageData: this.canvasToImage(),
                exportFormat: this.exportFormat,
            };
            this.databaseService.basicExport(newDrawingData).subscribe({
                next: (caught) => {
                    this.showSpinner = false;
                    if (caught.body === ExportStatus.Exported) {
                        this.dialog.open(ResponseMessageComponent, {
                            data: `Votre dessin a été exporté au format ${
                                this.exportFormat === ExportFormat.PNG ? 'PNG' : 'JPG'
                            } dans le dossier server/drawings.`,
                        });
                    }
                    this.isDisabled = false;
                    this.exportDialogRef.close();
                },
                error: (err) => {
                    this.showSpinner = false;

                    switch (err.error.body) {
                        case ExportStatus.WriteError:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Erreur d'écriture du fichier.",
                            });
                            break;

                        case ExportStatus.NotExported:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Votre dessin n'a pas pu être exporté localement.",
                            });
                            break;

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

    applyFilter(filter: string): void {
        this.currentFilter = filter;
        this.imagePreview.nativeElement.src = this.canvasToImage();
    }
}
