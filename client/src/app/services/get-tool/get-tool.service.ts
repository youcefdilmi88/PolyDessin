import { Injectable } from '@angular/core';
import { Tool } from '@classes/tool';
import { ToolShortcut } from '@enums/tool-shortcut';
import { BrushService } from '@tools/brush-service/brush.service';
import { ClipboardService } from '@tools/clipboard-service/clipboard.service';
import { EllipseService } from '@tools/ellipse-service/ellipse.service';
import { EraserService } from '@tools/eraser-service/eraser.service';
import { EyedropperService } from '@tools/eyedropper-service/eyedropper.service';
import { FeatherService } from '@tools/feather-service/feather.service';
import { LineService } from '@tools/line-service/line.service';
import { PaintBucketService } from '@tools/paint-bucket-service/paint-bucket.service';
import { PencilService } from '@tools/pencil-service/pencil.service';
import { PolygonService } from '@tools/polygon-service/polygon.service';
import { RectangleService } from '@tools/rectangle-service/rectangle.service';
import { SelectionEllipseService } from '@tools/selection/selection-ellipse/selection-ellipse.service';
import { SelectionRectangleService } from '@tools/selection/selection-rectangle/selection-rectangle.service';
import { SprayService } from '@tools/spray-service/spray.service';
import { StampService } from '@tools/stamp-service/stamp.service';
import { TextService } from '@tools/text/text.service';

@Injectable({
    providedIn: 'root',
})
export class GetToolService {
    constructor(
        pencilService: PencilService,
        brushService: BrushService,
        lineService: LineService,
        rectangleService: RectangleService,
        ellipseService: EllipseService,
        polygonService: PolygonService,
        eraserService: EraserService,
        paintBucketService: PaintBucketService,
        eyedropperService: EyedropperService,
        selectionRectangleService: SelectionRectangleService,
        selectionEllipseService: SelectionEllipseService,
        featherService: FeatherService,
        textService: TextService,
        sprayService: SprayService,
        stampService: StampService,
        clipboardService: ClipboardService,
    ) {
        this.tools
            .set(ToolShortcut.Pencil, pencilService)
            .set(ToolShortcut.Brush, brushService)
            .set(ToolShortcut.Line, lineService)
            .set(ToolShortcut.Rectangle, rectangleService)
            .set(ToolShortcut.Ellipse, ellipseService)
            .set(ToolShortcut.Polygon, polygonService)
            .set(ToolShortcut.Eraser, eraserService)
            .set(ToolShortcut.PaintBucket, paintBucketService)
            .set(ToolShortcut.Eyedropper, eyedropperService)
            .set(ToolShortcut.SelectionRectangle, selectionRectangleService)
            .set(ToolShortcut.SelectionEllipse, selectionEllipseService)
            .set(ToolShortcut.Stamp, stampService)
            .set(ToolShortcut.Feather, featherService)
            .set(ToolShortcut.Text, textService)
            .set(ToolShortcut.Clipboard, clipboardService)
            .set(ToolShortcut.Spray, sprayService);
        this.currentTool = pencilService;
    }

    tools: Map<string, Tool> = new Map<string, Tool>();
    currentTool: Tool;

    getTool(toolKey: string): Tool {
        const tool = this.tools.get(toolKey);
        if (tool) {
            this.currentTool = tool;
            return tool;
        } else {
            return this.currentTool;
        }
    }
}
