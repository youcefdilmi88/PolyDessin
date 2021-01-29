import { DeleteStatus } from '@common/communication/delete-status';
import { DrawingMetaData } from '@common/communication/drawing-meta-data';
import { InsertionStatus } from '@common/communication/insertion-status';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import 'reflect-metadata';

// CHANGE the URL for your database information
const DATABASE_URL = 'mongodb+srv://youcef:bonjour@cluster0.lggb7.mongodb.net/PolyDessin?retryWrites=true&w=majority';
const DATABASE_NAME = 'PolyDessin';
const DATABASE_COLLECTION = 'Drawings';
const TITLE_NAME_MAX_LENGTH = 15;
const TAG_NAME_MAX_LENGTH = 10;
const TAG_MAX_QUANTITY = 8;

@injectable()
export class DatabaseService {
    collection: Collection<DrawingMetaData>;
    client: MongoClient;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    start(): void {
        MongoClient.connect(DATABASE_URL, this.options)
            .then((client: MongoClient) => {
                this.client = client;
                this.collection = client.db(DATABASE_NAME).collection(DATABASE_COLLECTION);
            })
            .catch(() => {
                console.error('CONNECTION ERROR. EXITING PROCESS');
                process.exit(1);
            });
    }

    closeConnection(): void {
        this.client.close();
    }

    async getAllDrawings(): Promise<DrawingMetaData[]> {
        return this.collection.find({}).toArray();
    }

    async searchDrawings(searchedTags: string[]): Promise<DrawingMetaData[]> {
        if (searchedTags === undefined) {
            return this.collection.find({}).toArray();
        }
        if (!Array.isArray(searchedTags)) {
            return this.collection.find({ tags: { $in: [searchedTags] } }).toArray();
        } else {
            return this.collection.find({ tags: { $in: searchedTags } }).toArray();
        }
    }

    async addDrawing(drawingMeta: DrawingMetaData): Promise<InsertionStatus> {
        if (this.validateDrawing(drawingMeta)) {
            const isInserted = await this.collection.insertOne(drawingMeta);
            if (isInserted.insertedCount === 1) {
                return InsertionStatus.Inserted;
            } else {
                return InsertionStatus.NotInserted;
            }
        } else {
            return InsertionStatus.InvalidRequest;
        }
    }

    async deleteDrawing(idToDelete: string): Promise<DeleteStatus> {
        const x: number = +idToDelete;
        const deletedDrawing = await this.collection.findOneAndDelete({ id: x });
        if (deletedDrawing.value) {
            return DeleteStatus.Deleted;
        } else {
            return DeleteStatus.NothingFound;
        }
    }

    private validateDrawing(drawingMeta: DrawingMetaData): boolean {
        return this.validateTitle(drawingMeta.title) && this.validateTags(drawingMeta.tags);
    }
    private validateTitle(title: string): boolean {
        const validRegex = /^[a-zA-Z0-9 ]*$/;
        return validRegex.test(title) && title.length <= TITLE_NAME_MAX_LENGTH && title.length > 0;
    }
    private validateTags(tags: string[]): boolean {
        let isValid = true;
        const validRegex = /^[a-zA-Z0-9]*$/;
        isValid = tags.length <= TAG_MAX_QUANTITY;
        tags.forEach((tag) => {
            if (!(validRegex.test(tag) && tag.length <= TAG_NAME_MAX_LENGTH)) {
                isValid = false;
            }
        });
        return isValid;
    }
}
