import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MyErrorStateMatcher } from '@classes/my-error-state-matcher';
import { DeleteStatus } from '@common/communication/delete-status';
import { DrawingData } from '@common/communication/drawing-data';
import { FetchStatus } from '@common/communication/fetch-status';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { AutosaveService } from '@services/autosave/autosave.service';
import { CanvasResizerService } from '@services/canvas-resizer/canvas-resizer.service';
import { DatabaseService } from '@services/database/database.service';
import { DrawingService } from '@services/drawing/drawing.service';

const TAG_NAME_MAX_LENGTH = 9;
const TITLE_NAME_MAX_LENGTH = 15;
const TAG_MAX_QUANTITY = 8;
const MAX_NB_OF_VISIBLE_CARDS = 3;
@Component({
    selector: 'app-carrousel',
    templateUrl: './carrousel.component.html',
    styleUrls: ['./carrousel.component.scss'],
})
export class CarrouselComponent implements OnInit {
    constructor(
        private router: Router,
        private databaseService: DatabaseService,
        private dialog: MatDialog,
        private drawingService: DrawingService,
        private carrouselDialogRef: MatDialogRef<CarrouselComponent>,
        private canvasResizerService: CanvasResizerService,
        public autosaveService: AutosaveService,
    ) {}

    private isDeleting: boolean;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    indexMiddle: number = 1;
    indexLeft: number = 0;
    indexRight: number = 2;
    selectedIndex: number = 1;
    cards: DrawingData[] = [];
    isFetched: boolean = false;
    selectable: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    tags: string[] = [];
    matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
    tagFormControl: FormControl = new FormControl('', [Validators.maxLength(TAG_NAME_MAX_LENGTH), Validators.pattern('^[a-zA-Z0-9]*$')]);
    titleFormControl: FormControl = new FormControl('', [
        Validators.maxLength(TITLE_NAME_MAX_LENGTH),
        Validators.pattern('^[a-zA-Z0-9 ]*$'),
        Validators.required,
    ]);

    ngOnInit(): void {
        this.getDrawingsFromServer();
        this.carrouselDialogRef.afterClosed().subscribe(() => {
            if (this.isDeleting) {
                this.dialog.open(CarrouselComponent);
                this.dialog.open(ResponseMessageComponent, {
                    data: 'Le dessin a bien été supprimé',
                });
                this.isDeleting = false;
            }
        });
    }

    validateTag(): boolean {
        return this.tags.length < TAG_MAX_QUANTITY && !this.tagFormControl.hasError('maxlength') && !this.tagFormControl.hasError('pattern');
    }

    remove(tag: string): void {
        const index = this.tags.indexOf(tag);

        if (index >= 0) {
            this.tags.splice(index, 1);
        }
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Ajoute l'étiquette
        if ((value || '').trim() && this.validateTag()) this.tags.push(value.trim());

        // Réinitialise la valeur entrée
        if (input) input.value = '';
    }

    getDrawingsFromServer(): void {
        this.isFetched = false;
        this.databaseService
            .basicGet()
            // Transforme le messange en une string
            .subscribe({
                next: (drawings) => {
                    this.isFetched = true;
                    this.cards = [];
                    drawings.forEach((drawingData) => {
                        this.cards.push({
                            id: drawingData.id,
                            title: drawingData.title,
                            tags: drawingData.tags,
                            imageData: drawingData.imageData,
                            exportFormat: drawingData.exportFormat,
                        });
                    });
                    if (this.cards.length === 1) {
                        this.selectedIndex = 0;
                    }
                },
                error: (err) => {
                    this.isFetched = true;
                    switch (err.error.body) {
                        case FetchStatus.DatabaseError:
                            this.dialog.open(ResponseMessageComponent, {
                                data: 'Erreur de la base de données à distance.',
                            });
                            break;
                        case FetchStatus.NothingFound:
                            this.cards = [];
                            if (!this.isDeleting) {
                                this.dialog.open(ResponseMessageComponent, {
                                    data: 'Aucun dessin trouvé.',
                                });
                                this.isDeleting = false;
                            }
                            break;
                        default:
                            if (err.status === 0) {
                                this.dialog.open(ResponseMessageComponent, {
                                    data: 'Connexion au serveur refusée.',
                                });
                            }
                            break;
                    }
                },
            });
    }

    prevClick(): void {
        this.indexMiddle = this.nextIndex(this.indexMiddle);
        this.indexLeft = this.nextIndex(this.indexLeft);
        this.indexRight = this.nextIndex(this.indexRight);
        this.selectedIndex = this.indexMiddle;
    }

    nextClick(): void {
        this.indexMiddle = this.prevIndex(this.indexMiddle);
        this.indexLeft = this.prevIndex(this.indexLeft);
        this.indexRight = this.prevIndex(this.indexRight);
        this.selectedIndex = this.indexMiddle;
    }

    prevIndex(index: number): number {
        return index === 0 ? this.cards.length - 1 : index - 1;
    }
    nextIndex(index: number): number {
        return index === this.cards.length - 1 ? 0 : index + 1;
    }

    deleteDrawing(): void {
        this.isFetched = false;
        this.isDeleting = true;
        const confirmed = confirm('Êtes-vous certain de vouloir supprimer ce dessin ?');
        if (confirmed) {
            this.databaseService.basicDelete(this.cards[this.selectedIndex].id.toString()).subscribe({
                next: () => {
                    this.isFetched = true;
                    this.carrouselDialogRef.close();
                },
                error: (err) => {
                    this.isDeleting = false;
                    this.isFetched = true;
                    switch (err.error.body) {
                        case DeleteStatus.DatabaseError:
                            this.dialog.open(ResponseMessageComponent, {
                                data: 'Erreur de la base de données à distance.',
                            });
                            break;
                        case DeleteStatus.NothingFound:
                            this.dialog.open(ResponseMessageComponent, {
                                data: 'Aucun dessin trouvé pour la suppression.',
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
                },
            });
        }
    }

    loadDrawing(): void {
        let confirmed = true;
        if (this.router.url === '/home') {
            this.router.navigateByUrl('/editor');
        } else {
            if (this.drawingService.editStack.length !== 0) {
                confirmed = confirm('Êtes-vous certain de vouloir abandonner vos modifications ?');
            }
        }
        if (confirmed) {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const img = new Image();
            img.onload = () => {
                this.drawingService.previewCanvas.width = this.drawingService.baseCanvas.width = img.width;
                this.drawingService.previewCanvas.height = this.drawingService.baseCanvas.height = img.height;
                this.drawingService.baseCtx.drawImage(img, 0, 0);
            };
            img.src = this.cards[this.selectedIndex].imageData;
            const rightGrabberPosition = this.canvasResizerService.computeRightGrabberPosition(img.width, img.height);
            const bottomGrabberPosition = this.canvasResizerService.computeBottomGrabberPosition(img.width, img.height);
            const cornerGrabberPosition = this.canvasResizerService.computeCornerGrabberPosition(img.width, img.height);
            this.canvasResizerService.rightGrabberElement.style.top = `${rightGrabberPosition.y}px`;
            this.canvasResizerService.rightGrabberElement.style.left = `${rightGrabberPosition.x}px`;
            this.canvasResizerService.cornerGrabberElement.style.top = `${cornerGrabberPosition.y}px`;
            this.canvasResizerService.cornerGrabberElement.style.left = `${cornerGrabberPosition.x}px`;
            this.canvasResizerService.bottomGrabberElement.style.top = `${bottomGrabberPosition.y}px`;
            this.canvasResizerService.bottomGrabberElement.style.left = `${bottomGrabberPosition.x}px`;
            this.carrouselDialogRef.close();
            // this.autosaveService.saveCurrentDrawing();
        }
    }

    @HostListener('document:keydown', ['$event'])
    leftRightScrolling(event: KeyboardEvent): void {
        const pressedKey = event.key;

        switch (pressedKey) {
            case 'ArrowRight':
                this.nextClick();
                break;

            case 'ArrowLeft':
                this.prevClick();

                break;

            default:
                break;
        }
    }

    selectRightDrawing(): void {
        if (this.cards.length <= MAX_NB_OF_VISIBLE_CARDS) this.selectedIndex = 2;
    }
    selectMiddleDrawing(): void {
        if (this.cards.length <= MAX_NB_OF_VISIBLE_CARDS) this.selectedIndex = 1;
    }
    selectLeftDrawing(): void {
        if (this.cards.length <= MAX_NB_OF_VISIBLE_CARDS) this.selectedIndex = 0;
    }

    carrouselContainerWidth(): string {
        return this.cards.length > 2 ? '1000px' : this.cards.length === 2 ? '661px' : '323px';
    }

    dialogWidth(): string {
        return this.cards.length > 2 ? '1280px' : this.cards.length === 2 ? '800px' : '600px';
    }

    searchForTags(): void {
        this.isFetched = false;
        this.databaseService.basicSearch(this.tags).subscribe({
            next: (drawings) => {
                this.isFetched = true;
                this.cards = [];
                drawings.forEach((drawingData) => {
                    this.cards.push({
                        id: drawingData.id,
                        title: drawingData.title,
                        tags: drawingData.tags,
                        imageData: drawingData.imageData,
                        exportFormat: drawingData.exportFormat,
                    });
                });
                if (this.cards.length === 1) {
                    this.selectedIndex = 0;
                }
            },
            error: (err) => {
                this.isFetched = true;
                switch (err.error.body) {
                    case FetchStatus.DatabaseError:
                        this.dialog.open(ResponseMessageComponent, {
                            data: 'Erreur de la base de données à distance.',
                        });
                        break;
                    case FetchStatus.NothingFound:
                        this.cards = [];
                        if (!this.isDeleting) {
                            this.dialog.open(ResponseMessageComponent, {
                                data: 'Aucun dessin trouvé.',
                            });
                            this.isDeleting = false;
                        }
                        break;
                    default:
                        if (err.status === 0) {
                            this.dialog.open(ResponseMessageComponent, {
                                data: 'Connexion au serveur refusée.',
                            });
                        }
                        break;
                }
            },
        });
    }

    selectedPosition(): string {
        if (this.cards.length === 2) {
            return this.selectedIndex === 0 ? '23%' : '75%';
        } else if (this.cards.length === MAX_NB_OF_VISIBLE_CARDS) {
            switch (this.selectedIndex) {
                case 0:
                    return '15%';
                case 2:
                    return '84%';
                default:
                    return '50%';
            }
        } else {
            return '50%';
        }
    }
}
