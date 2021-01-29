import { Injectable } from '@angular/core';
import { DrawTool } from '@classes/draw-tool';
import { MouseButton } from '@enums/mouse-button';
import { ToolName } from '@enums/tool-name';
import { DrawingService } from '@services/drawing/drawing.service';

const IMPOSSIBLE_COLOR_VALUE = -1;
const MAX_COLOR_VALUE = 255;
const MAX_TOLERANCE = 100;
const INF_GREEN_MARGIN = 3;
const SUP_BLUE_MARGIN = 4;
const INF_BLUE_MARGIN = 5;
const FILL_COLOR_FILLSTACK_INDEX = 3;
const NUMBER_VALUES_IN_PIXEL = 4;
const ALPHA_OFFSET = 3;

@Injectable({
    providedIn: 'root',
})
export class PaintBucketService extends DrawTool {
    constructor(public drawingService: DrawingService) {
        super(drawingService);
    }
    toolName: ToolName = ToolName.PaintBucket;
    tolerance: number = 0;
    margins: number[] = [];
    pixelFillStack: [number, number, number[], number[]][] = [];
    imageData: ImageData;

    setCurrentTolerance(tolerance: number): void {
        this.tolerance = tolerance;
    }

    onMouseDown(event: MouseEvent): void {
        this.drawingService.previewCtx.canvas.style.cursor = 'crosshair';
        this.imageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.baseCanvas.width, this.drawingService.baseCanvas.height);
        this.mouseDown = true;
        this.mouseDownCoord = this.getPositionFromMouse(event);

        // On récupère la couleur du pixel initialement cliqué
        const targetColor = this.getPixelColor(this.mouseDownCoord.x, this.mouseDownCoord.y);
        this.computeToleranceMargins(targetColor);

        if (event.button === MouseButton.Left)
            this.floodFillRegionLeftClick(this.mouseDownCoord.x, this.mouseDownCoord.y, targetColor, this.hexToRgba(this.currentPrimaryColor));
        else if (event.button === MouseButton.Right) this.fillSameColorPixelsRightClick(this.hexToRgba(this.currentPrimaryColor));

        this.pixelFillStack = [];
        this.margins = [];
        this.drawingService.addInEditStack();
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
    }

    private getPixelColor(x: number, y: number): number[] {
        if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height) {
            // Dans le cas où on demande un pixel en dehors du tableau, return couleur impossible
            return [IMPOSSIBLE_COLOR_VALUE, IMPOSSIBLE_COLOR_VALUE, IMPOSSIBLE_COLOR_VALUE, IMPOSSIBLE_COLOR_VALUE];
        } else {
            // Pour calculer l'index du pixel dans l'array ImageData
            const offset = (y * this.imageData.width + x) * NUMBER_VALUES_IN_PIXEL;
            return [
                this.imageData.data[offset + 0],
                this.imageData.data[offset + 1],
                this.imageData.data[offset + 2],
                this.imageData.data[offset + ALPHA_OFFSET],
            ];
        }
    }

    private setPixelColor(offset: number, newColor: number[]): void {
        this.imageData.data[offset + 0] = newColor[0];
        this.imageData.data[offset + 1] = newColor[1];
        this.imageData.data[offset + 2] = newColor[2];
        this.imageData.data[offset + ALPHA_OFFSET] = newColor[ALPHA_OFFSET];
    }

    private floodFillRegionLeftClick(x: number, y: number, targetColor: number[], fillColor: number[] | null): void {
        if (fillColor !== null) {
            // On le fait au moins une première fois avec le pixel cliqué pour remplir la fillStack
            this.fillPixel(x, y, targetColor, fillColor);
            // Puis on rentre dans la récursion
            this.fillRecursion();
        }
    }

    private fillSameColorPixelsRightClick(fillColor: number[] | null): void {
        if (fillColor !== null) {
            for (let i = 0; i < this.imageData.data.length; i += NUMBER_VALUES_IN_PIXEL) {
                // On crée un tableau qui va contenir les valeurs RGBA du pixel courant
                const currentPixelColor: number[] = [];
                currentPixelColor.push(this.imageData.data[i + 0]);
                currentPixelColor.push(this.imageData.data[i + 1]);
                currentPixelColor.push(this.imageData.data[i + 2]);
                currentPixelColor.push(this.imageData.data[i + ALPHA_OFFSET]);

                // On check si la couleur du pixel courant correspond à celle du pixel initial
                // Si oui, on modifie la couleur du pixel courant, sinon, on passe au prochain pixel
                if (this.doesTargetColorTolerate(currentPixelColor)) this.setPixelColor(i, fillColor);
                else continue;
            }
            this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
        }
    }

    private fillPixel(x: number, y: number, targetColor: number[], fillColor: number[]): void {
        // On récupère la couleur du pixel courant
        const currentColor = this.getPixelColor(x, y);

        // Sans cette condition, il y a récursion infinie. Elle permet de vérifier qu'on est déjà passé par un pixel.
        if (!this.doColorsMatch(currentColor, fillColor)) {
            // On check que la couleur du pixel courant soit la même que celle du pixel initialement cliqué
            // C'est à dire on cherche la "bordure"

            if (this.doesTargetColorTolerate(currentColor)) {
                const offset = (y * this.imageData.width + x) * NUMBER_VALUES_IN_PIXEL;
                this.setPixelColor(offset, fillColor);

                // On ajoute les voisins du pixel à la fillStack ainsi que TargetColor et FillColor
                this.pixelFillStack.push([x + 1, y, targetColor, fillColor]); // voisin de droite
                this.pixelFillStack.push([x - 1, y, targetColor, fillColor]); // voisin de gauche
                this.pixelFillStack.push([x, y + 1, targetColor, fillColor]); // voisin du bas
                this.pixelFillStack.push([x, y - 1, targetColor, fillColor]); // voisin du haut
            }
        }
    }

    private fillRecursion(): void {
        if (this.pixelFillStack.length) {
            const range = this.pixelFillStack.length;

            // Sur chaque pixel de la fillStack, on appelle fillPixel, qui modifie sa couleur et remplit la fillStack, etcetc
            for (let i = 0; i < range; i++) {
                this.fillPixel(
                    this.pixelFillStack[i][0],
                    this.pixelFillStack[i][1],
                    this.pixelFillStack[i][2],
                    this.pixelFillStack[i][FILL_COLOR_FILLSTACK_INDEX],
                );
                // Exemple de contenu de fillStack: [x + 1, y, targetColor, fillColor]
            }

            // Cette ligne permet de vider la stack avant de refaire un tour de récursion
            this.pixelFillStack.splice(0, range);
            this.fillRecursion();
        } else {
            // Si le dernier tour n'a pas rempli la fillStack, alors on update l'image avec les pixels colorés par fillPixel
            this.drawingService.baseCtx.putImageData(this.imageData, 0, 0);
            this.pixelFillStack = [];
        }
    }

    private doColorsMatch(a: number[], b: number[]): boolean {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[ALPHA_OFFSET] === b[ALPHA_OFFSET];
    }

    private hexToRgba(hex: string): number[] | null {
        // On ajoute au param hex, un tableau de résultats de la recherche Regex sur ce dernier. permet de séparer les paires hexadecimales
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        // On retourne un tableau RGBA du nombre entré en hexa, sinon on retourne null en cas d'entrée invalide
        return result
            ? [parseInt(result[0 + 1], 16), parseInt(result[1 + 1], 16), parseInt(result[2 + 1], 16), parseInt(result[ALPHA_OFFSET + 1], 16)]
            : null;
        // On commence à parseInt(result[1]) et pas 0 car il y a le param hex de base
    }

    private doesTargetColorTolerate(currentColor: number[]): boolean {
        let tolerate = false;
        if (currentColor[0] <= this.margins[0] && currentColor[0] >= this.margins[1]) tolerate = true;
        else if (currentColor[1] <= this.margins[2] && currentColor[1] >= this.margins[INF_GREEN_MARGIN]) tolerate = true;
        else if (currentColor[2] <= this.margins[SUP_BLUE_MARGIN] && currentColor[2] >= this.margins[INF_BLUE_MARGIN]) tolerate = true;

        return tolerate;
    }

    private computeToleranceMargins(targetColor: number[]): void {
        const spacing: number = Math.round(((this.tolerance / MAX_TOLERANCE) * MAX_COLOR_VALUE) / 2);

        const supRedMargin: number = targetColor[0] + spacing > MAX_COLOR_VALUE ? MAX_COLOR_VALUE : targetColor[0] + spacing;
        const infRedMargin: number = targetColor[0] - spacing < 0 ? 0 : targetColor[0] - spacing;
        const supGreenMargin: number = targetColor[1] + spacing > MAX_COLOR_VALUE ? MAX_COLOR_VALUE : targetColor[1] + spacing;
        const infGreenMargin: number = targetColor[1] - spacing < 0 ? 0 : targetColor[1] - spacing;
        const supBlueMargin: number = targetColor[2] + spacing > MAX_COLOR_VALUE ? MAX_COLOR_VALUE : targetColor[2] + spacing;
        const infBlueMargin: number = targetColor[2] - spacing < 0 ? 0 : targetColor[2] - spacing;

        this.margins.push(supRedMargin);
        this.margins.push(infRedMargin);
        this.margins.push(supGreenMargin);
        this.margins.push(infGreenMargin);
        this.margins.push(supBlueMargin);
        this.margins.push(infBlueMargin);
    }
}
