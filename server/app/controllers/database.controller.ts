import { TYPES } from '@app/types';
import { DeleteStatus } from '@common/communication/delete-status';
import { DrawingData } from '@common/communication/drawing-data';
import { DrawingEmailData } from '@common/communication/drawing-email-data';
import { DrawingImageData } from '@common/communication/drawing-image-data';
import { DrawingMetaData } from '@common/communication/drawing-meta-data';
import { ExportFormat } from '@common/communication/export-format';
import { ExportStatus } from '@common/communication/export-status';
import { FetchStatus } from '@common/communication/fetch-status';
import { InsertionStatus } from '@common/communication/insertion-status';
import { SendStatus } from '@common/communication/send-status';
import axios, { AxiosRequestConfig } from 'axios';
import { NextFunction, Request, Response, Router } from 'express';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { inject, injectable } from 'inversify';
import { DatabaseService } from '../services/database.service';

const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_ERROR = 500;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_OK = 200;
// const HTTP_STATUS_ERROR_BOUNDARY = 300;

@injectable()
export class DatabaseController {
    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.databaseService.start();
        this.configureRouter();
    }

    router: Router;
    private drawingsImageData: DrawingImageData[] = [];

    private configureRouter(): void {
        this.router = Router();

        this.router.delete('/delete', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService.deleteDrawing(req.query.drawing).then(
                (result) => {
                    switch (result) {
                        case DeleteStatus.Deleted:
                            res.status(HTTP_STATUS_OK).send({ body: result });
                            break;
                        case DeleteStatus.NothingFound:
                            res.status(HTTP_STATUS_OK).send({ body: result });
                            break;

                        default:
                            break;
                    }
                },
                (error) => {
                    res.status(HTTP_STATUS_ERROR).send({ body: InsertionStatus.DatabaseError });
                },
            );
        });

        this.router.post('/save', (req: Request, res: Response, next: NextFunction) => {
            const drawingData: DrawingData = req.body;
            const drawingMeta: DrawingMetaData = {
                id: drawingData.id,
                title: drawingData.title,
                tags: drawingData.tags,
                exportFormat: drawingData.exportFormat,
            };
            const isPNG = drawingMeta.exportFormat === ExportFormat.PNG ? true : false;
            const drawingImageData: DrawingImageData = { id: drawingData.id, imageData: drawingData.imageData };
            this.drawingsImageData.push(drawingImageData);
            this.databaseService.addDrawing(drawingMeta).then(
                (result) => {
                    switch (result) {
                        case InsertionStatus.Inserted:
                            if (isPNG) {
                                const data = drawingData.imageData.replace(/^data:image\/\w+;base64,/, '');
                                const buf = Buffer.from(data, 'base64');
                                fs.writeFile(`./drawings/${drawingData.title.replace(/\s/g, '')}.png`, buf, (err) => {
                                    if (err) {
                                        res.status(HTTP_STATUS_ERROR).send({ body: InsertionStatus.WriteError });
                                    } else {
                                        res.status(HTTP_STATUS_CREATED).send({ body: InsertionStatus.savedAsPNGAndInserted });
                                    }
                                });
                            } else {
                                res.status(HTTP_STATUS_CREATED).send({ body: result });
                            }
                            break;
                        case InsertionStatus.NotInserted:
                            res.status(HTTP_STATUS_ERROR).send({ body: result });

                            break;
                        case InsertionStatus.InvalidRequest:
                            res.status(HTTP_STATUS_ERROR).send({ body: result });
                            break;

                        default:
                            break;
                    }
                },
                (error) => {
                    res.status(HTTP_STATUS_ERROR).send({ body: InsertionStatus.DatabaseError });
                },
            );
        });

        this.router.post('/export', (req: Request, res: Response, next: NextFunction) => {
            const drawingData: DrawingData = req.body;

            const data = drawingData.imageData.replace(/^data:image\/\w+;base64,/, '');
            const buf = Buffer.from(data, 'base64');
            fs.writeFile(
                `./drawings/${drawingData.title.replace(/\s/g, '')}.${drawingData.exportFormat === ExportFormat.PNG ? 'png' : 'jpeg'}`,
                buf,
                (err) => {
                    if (err) {
                        res.status(HTTP_STATUS_ERROR).send({ body: ExportStatus.WriteError });
                    } else {
                        res.status(HTTP_STATUS_CREATED).send({ body: ExportStatus.Exported });
                    }
                },
            );
        });

        this.router.post('/send', (req: Request, res: Response, next: NextFunction) => {
            const drawingEmailData: DrawingEmailData = req.body;

            const data = drawingEmailData.data.imageData.replace(/^data:image\/\w+;base64,/, '');
            const buf = Buffer.from(data, 'base64');
            const fileName = `${drawingEmailData.data.title.replace(/\s/g, '')}.${
                drawingEmailData.data.exportFormat === ExportFormat.PNG ? 'png' : 'jpeg'
            }`;
            fs.writeFile(`./emailed/${fileName}`, buf, (err) => {
                if (err) {
                    res.status(HTTP_STATUS_ERROR).send({ body: SendStatus.WriteError });
                } else {
                    const formData = new FormData();
                    formData.append('payload', fs.createReadStream(`./emailed/${fileName}`));
                    formData.append('to', drawingEmailData.email);

                    const config = {
                        method: 'post',
                        url: 'http://log2990.step.polymtl.ca/email',
                        headers: {
                            'X-Team-Key': 'e4465c03-581a-4e89-bc9c-4f91a1a0df65',
                            ...formData.getHeaders(),
                        },
                        data: formData,
                    } as AxiosRequestConfig;

                    axios(config)
                        .then((response) => {
                            res.status(HTTP_STATUS_OK).send({ body: SendStatus.SentExported });
                        })
                        .catch((error) => {
                            res.status(HTTP_STATUS_ERROR).send({ body: SendStatus.NotSent });
                        });
                }
            });
        });

        this.router.get('/all', (req: Request, res: Response, next: NextFunction) => {
            this.databaseService.getAllDrawings().then(
                (result) => {
                    const drawingsData: DrawingData[] = [];
                    result.forEach((element) => {
                        const imgData = this.drawingsImageData.find((image) => image.id === element.id);
                        if (imgData) {
                            drawingsData.push({
                                id: element.id,
                                title: element.title,
                                tags: element.tags,
                                imageData: imgData.imageData,
                                exportFormat: element.exportFormat,
                            });
                        }
                    });
                    if (drawingsData.length > 0) {
                        res.json(drawingsData);
                    } else {
                        res.status(HTTP_STATUS_NOT_FOUND).send({ body: FetchStatus.NothingFound });
                    }
                },
                (error) => {
                    res.status(HTTP_STATUS_ERROR).send({ body: FetchStatus.DatabaseError });
                },
            );
        });

        this.router.get('/search', (req: Request, res: Response, next: NextFunction) => {
            this.databaseService.searchDrawings(req.query.tags).then(
                (result) => {
                    const drawingsData: DrawingData[] = [];
                    result.forEach((element) => {
                        const imgData = this.drawingsImageData.find((image) => image.id === element.id);
                        if (imgData) {
                            drawingsData.push({
                                id: element.id,
                                title: element.title,
                                tags: element.tags,
                                imageData: imgData.imageData,
                                exportFormat: element.exportFormat,
                            });
                        }
                    });
                    if (drawingsData.length > 0) {
                        res.json(drawingsData);
                    } else {
                        res.status(HTTP_STATUS_NOT_FOUND).send({ body: FetchStatus.NothingFound });
                    }
                },
                (error) => {
                    res.status(HTTP_STATUS_ERROR).send({ body: FetchStatus.DatabaseError });
                },
            );
        });
    }
}
