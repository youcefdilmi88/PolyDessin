import { ExportFormat } from '@common/communication/export-format';
export interface DrawingData {
    id: number;
    title: string;
    tags: string[];
    imageData: string;
    exportFormat: ExportFormat;
}
