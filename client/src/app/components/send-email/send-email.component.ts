import { AfterViewInit, Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '@classes/my-error-state-matcher';
import { DrawingData } from '@common/communication/drawing-data';
import { DrawingEmailData } from '@common/communication/drawing-email-data';
import { ExportFormat } from '@common/communication/export-format';
import { SendStatus } from '@common/communication/send-status';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { DatabaseService } from '@services/database/database.service';
import { DrawingService } from '@services/drawing/drawing.service';

const TITLE_NAME_MAX_LENGTH = 15;

@Component({
    selector: 'app-send-email',
    templateUrl: './send-email.component.html',
    styleUrls: ['./send-email.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class SendEmailComponent implements AfterViewInit {
    constructor(
        private drawingService: DrawingService,
        private databaseService: DatabaseService,
        private sendEmailDialogRef: MatDialogRef<SendEmailComponent>,
        private dialog: MatDialog,
    ) {}

    @ViewChild('imagePreview', { static: false }) imagePreview: ElementRef<HTMLImageElement>;
    @ViewChild('titleInput', { static: true }) titleInput: ElementRef;
    @ViewChild('emailInput', { static: true }) emailInput: ElementRef;
    currentFilter: string = '';
    isDisabled: boolean = false;
    exportFormat: ExportFormat = ExportFormat.JPG;
    showSpinner: boolean = false;
    titleFormControl: FormControl = new FormControl('', [
        Validators.maxLength(TITLE_NAME_MAX_LENGTH),
        Validators.pattern('^[a-zA-Z0-9 ]*$'),
        Validators.required,
    ]);
    emailFormControl: FormControl = new FormControl('', [Validators.email, Validators.required]);
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
            this.emailFormControl.hasError('email') ||
            this.emailFormControl.hasError('required') ||
            this.isDisabled
        );
    }

    // Methode inspirée de stackOverflow
    /*https://stackoverflow.com/questions/32160098/
    change-html-canvas-black-background-to-white-background-when-creating-jpg-image*/
    canvasToImage(): string {
        const context = this.drawingService.baseCtx;
        const canvas = context.canvas;
        // cache height and width
        const w = canvas.width;
        const h = canvas.height;

        let data;

        // get the current ImageData for the canvas.
        data = context.getImageData(0, 0, w, h);
        // store the current globalCompositeOperation
        const compositeOperation = context.globalCompositeOperation;

        // set to draw behind current content
        context.globalCompositeOperation = 'destination-over';

        // set background color
        context.fillStyle = 'white';

        // draw background / rect on entire canvas
        context.fillRect(0, 0, w, h);

        context.globalCompositeOperation = compositeOperation;
        context.filter = this.currentFilter;
        context.drawImage(canvas, 0, 0);

        // get the image data from the canvas
        const imageData = canvas.toDataURL(`image/${this.exportFormat === ExportFormat.JPG ? 'jpeg' : 'png'}`);
        // clear the canvas
        context.clearRect(0, 0, w, h);

        // restore it with original / cached ImageData
        context.putImageData(data, 0, 0);

        // reset the globalCompositeOperation to what it was
        context.globalCompositeOperation = compositeOperation;

        context.filter = 'none';

        // return the Base64 encoded data url string
        return imageData;
    }

    sendDrawing(): void {
        const confirmSend = confirm('Êtes-vous certain de vouloir envoyer votre dessin ?');
        if (confirmSend) {
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
            const newDrawingEmailData: DrawingEmailData = {
                data: newDrawingData,
                email: this.emailInput.nativeElement.value,
            };
            this.databaseService.basicSendByEmail(newDrawingEmailData).subscribe({
                next: (caught) => {
                    this.showSpinner = false;
                    if (caught.body === SendStatus.SentExported) {
                        this.dialog.open(ResponseMessageComponent, {
                            data: `Votre dessin a été exporté au format ${
                                this.exportFormat === ExportFormat.PNG ? 'PNG' : 'JPG'
                            } dans le dossier server/emailed et envoyé à l'adresse ${newDrawingEmailData.email}.`,
                        });
                    }
                    this.isDisabled = false;
                    this.sendEmailDialogRef.close();
                },
                error: (err) => {
                    this.showSpinner = false;
                    switch (err.error.body) {
                        case SendStatus.WriteError:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Erreur d'écriture du fichier.",
                            });
                            break;

                        case SendStatus.NotSent:
                            this.dialog.open(ResponseMessageComponent, {
                                data: "Votre dessin n'a pas pu être envoyé par courriel.",
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
