import { Component, HostListener, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarrouselComponent } from '@components/carrousel/carrousel.component';
import { PopupExportDrawingComponent } from '@components/popup-export-drawing/popup-export-drawing.component';
import { PopupNewDrawingComponent } from '@components/popup-new-drawing/popup-new-drawing.component';
import { PopupSaveDrawingComponent } from '@components/popup-save-drawing/popup-save-drawing.component';
import { ResponseMessageComponent } from '@components/response-message/response-message.component';
import { SendEmailComponent } from '@components/send-email/send-email.component';
import { UserManualDialogComponent } from '@components/user-manual-dialog/user-manual-dialog.component';
import { ToolName } from '@enums/tool-name';
import { ToolShortcut } from '@enums/tool-shortcut';
import { AutosaveService } from '@services/autosave/autosave.service';
import { DrawingService } from '@services/drawing/drawing.service';
import { ToolManagerService } from '@services/tool-manager/tool-manager.service';
import { UndoRedoService } from '@services/undo-redo/undo-redo.service';
import { StampService } from '@tools/stamp-service/stamp.service';
import { TextService } from '@tools/text/text.service';

const MAX_SQUARE_SIZE_200 = 200;
const MIN_SQUARE_SIZE_20 = 20;
const SQUARE_SIZE_STEP_5 = 5;
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
@Injectable({
    providedIn: 'root',
})
export class SidebarComponent {
    constructor(
        public toolManagerService: ToolManagerService,
        public drawingService: DrawingService,
        public dialog: MatDialog,
        public undoRedoService: UndoRedoService,
        public autosaveService: AutosaveService,
        public textService: TextService,
    ) {}
    isDialogOpened: boolean = false;
    isGridOn: boolean = false;
    prevTool: string[] = [];

    handleClickToggleGrid(): void {
        this.isGridOn = !this.isGridOn;
        this.toolManagerService.isGridOn = !this.toolManagerService.isGridOn;
    }

    backHome(): void {
        this.autosaveService.wantsToContinue = false;
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardToolSelection(event: KeyboardEvent): void {
        if (!this.isDialogOpened) {
            const pressedKey = event.key;
            const tool = Object.keys(ToolShortcut).find((key) => ToolShortcut[key as keyof typeof ToolShortcut] === pressedKey);
            const toolEnumValue: ToolShortcut = ToolShortcut[tool as keyof typeof ToolShortcut];
            this.toolManagerService.selectToolFromUserInput(toolEnumValue);
            this.toolManagerService.toolChangeEmitter.emit(true);
        }
    }

    private confirmText(clickedButton: string): void {
        this.prevTool.push(clickedButton);
        if (clickedButton !== 't' && this.prevTool.length === 2 && this.prevTool[0] === 't') {
            if (!this.textService.inTxtZone || this.textService.inc === 0) {
                this.textService.done();
                this.prevTool = [];
            }
        }
    }

    handleClickToolSelection(event: MouseEvent): void {
        const clickedButton = (event.currentTarget as HTMLElement).id;
        this.confirmText(clickedButton);
        const tool = Object.keys(ToolShortcut).find((key) => ToolShortcut[key as keyof typeof ToolShortcut] === clickedButton);
        const toolEnumValue: ToolShortcut = ToolShortcut[tool as keyof typeof ToolShortcut];
        this.toolManagerService.selectToolFromUserInput(toolEnumValue);
        this.toolManagerService.toolChangeEmitter.emit(true);
    }

    handleStampToolSelection(event: MouseEvent): void {
        this.handleClickToolSelection(event);
        (this.toolManagerService.getToolService.getTool('d') as StampService).initialiseScale();
    }

    checkUndo(): boolean {
        return this.drawingService.isToolInUse || this.drawingService.isStackEmpty ? true : false;
    }

    checkRedo(): boolean {
        return this.drawingService.isToolInUse || this.drawingService.isStackEmptyRedo ? true : false;
    }

    openNewDrawingDialog(): void {
        if (this.drawingService.editStack.length !== 0) {
            this.isDialogOpened = true;
            this.toolManagerService.isDialogOpenedEmitter.emit(true);
            const dialogRef = this.dialog.open(PopupNewDrawingComponent);
            dialogRef.afterClosed().subscribe(() => {
                this.isDialogOpened = false;
                this.toolManagerService.isDialogOpenedEmitter.emit(false);
            });
        } else this.dialog.open(ResponseMessageComponent, { data: 'Vous êtes déjà sur un canvas vierge.' });
    }

    openSaveDrawingDialog(): void {
        if (this.drawingService.editStack.length !== 0) {
            this.isDialogOpened = true;
            this.toolManagerService.isDialogOpenedEmitter.emit(true);
            const dialogRef = this.dialog.open(PopupSaveDrawingComponent);
            dialogRef.afterClosed().subscribe(() => {
                this.isDialogOpened = false;
                this.toolManagerService.isDialogOpenedEmitter.emit(false);
            });
        } else this.dialog.open(ResponseMessageComponent, { data: 'Rien à sauvegarder !' });
    }

    openExportDialog(): void {
        if (this.drawingService.editStack.length !== 0) {
            this.isDialogOpened = true;
            this.toolManagerService.isDialogOpenedEmitter.emit(true);
            const dialogRef = this.dialog.open(PopupExportDrawingComponent, {
                width: '550px',
            });
            dialogRef.afterClosed().subscribe(() => {
                this.isDialogOpened = false;
                this.toolManagerService.isDialogOpenedEmitter.emit(false);
            });
        } else this.dialog.open(ResponseMessageComponent, { data: 'Rien à exporter !' });
    }

    openCarrouselDialog(): void {
        this.isDialogOpened = true;
        this.toolManagerService.isDialogOpenedEmitter.emit(true);
        const dialogRef = this.dialog.open(CarrouselComponent);
        dialogRef.afterClosed().subscribe(() => {
            this.isDialogOpened = false;
            this.toolManagerService.isDialogOpenedEmitter.emit(false);
        });
    }

    openSendByEmailDialog(): void {
        if (this.drawingService.editStack.length !== 0) {
            this.isDialogOpened = true;
            this.toolManagerService.isDialogOpenedEmitter.emit(true);
            const dialogRef = this.dialog.open(SendEmailComponent);
            dialogRef.afterClosed().subscribe(() => {
                this.isDialogOpened = false;
                this.toolManagerService.isDialogOpenedEmitter.emit(false);
            });
        } else this.dialog.open(ResponseMessageComponent, { data: 'Rien à envoyer !' });
    }

    openUserManualDialog(): void {
        this.toolManagerService.isDialogOpenedEmitter.emit(true);
        this.isDialogOpened = true;
        const dialogRef = this.dialog.open(UserManualDialogComponent, {
            width: '1100px',
            height: '700px',
        });
        dialogRef.afterClosed().subscribe(() => {
            this.isDialogOpened = false;
            this.toolManagerService.isDialogOpenedEmitter.emit(false);
        });
    }

    increaseGridSquareSize(): void {
        if (this.toolManagerService.currentGridSquareSize < MAX_SQUARE_SIZE_200) this.toolManagerService.currentGridSquareSize += SQUARE_SIZE_STEP_5;
    }

    decreaseGridSquareSize(): void {
        if (this.toolManagerService.currentGridSquareSize > MIN_SQUARE_SIZE_20) this.toolManagerService.currentGridSquareSize -= SQUARE_SIZE_STEP_5;
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (event.ctrlKey && !this.isDialogOpened) {
            switch (event.key) {
                case 'o':
                    this.openNewDrawingDialog();
                    break;
                case 's':
                    this.openSaveDrawingDialog();
                    break;
                case 'e':
                    this.openExportDialog();
                    break;
                case 'g':
                    this.openCarrouselDialog();
                    break;
                case '2':
                    this.openSendByEmailDialog();
                    break;
                default:
                    break;
            }
        } else if (!this.isDialogOpened && this.toolManagerService.currentTool.toolName !== ToolName.Text) {
            switch (event.key) {
                case 'g':
                    this.handleClickToggleGrid();
                    break;
                case '=':
                    this.increaseGridSquareSize();
                    break;
                case '-':
                    this.decreaseGridSquareSize();
                    break;
                default:
                    break;
            }
        }
    }
}
