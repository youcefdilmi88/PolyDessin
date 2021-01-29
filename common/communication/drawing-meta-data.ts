import { ExportFormat } from './export-format';

export interface DrawingMetaData {
    id: number;
    title: string;
    tags: string[];
    exportFormat: ExportFormat;
}
