
import { FieldType, TimestampField } from "soukai";
import { defineSolidModelSchema } from "soukai-solid";
import { ISoukaiDocumentBase } from "../shared/contracts";


export type IBookmarkDocument = ISoukaiDocumentBase & {
    title: string
    link: string
}

export const BookmarkSchema = defineSolidModelSchema({
    rdfContexts: {
        'bookm': 'http://www.w3.org/2002/01/bookmark#',
        'dct': 'http://purl.org/dc/terms/',
    },
    rdfsClasses: ['bookm:Bookmark'],
    timestamps: [TimestampField.CreatedAt],
    fields: {
        title: {
            type: FieldType.String,
            rdfProperty: 'dct:title',
        },
        link: {
            type: FieldType.String,
            rdfProperty: 'bookm:recalls',
        },
    },
});


export class Bookmark extends BookmarkSchema { }

export class BookmarkFactory {
    private static instance: BookmarkFactory;

    private constructor(private containerUrl: string) { }

    public static getInstance(containerUrl: string): BookmarkFactory {
        if (!BookmarkFactory.instance) {
            BookmarkFactory.instance = new BookmarkFactory(containerUrl);
        }

        return BookmarkFactory.instance;
    }

    async getAll() {
        return await Bookmark.all();
    }

    async get(id: string) {
        return await Bookmark.find(id)
    }

    async create(payload: IBookmarkDocument) {
        const bookmark = new Bookmark(payload);
        return await await bookmark.save(this.containerUrl);
    }

    async update(id: string, payload: IBookmarkDocument) {
        const bookmark = await Bookmark.find(id)
        return await await bookmark?.update(payload);
    }

    async remove(id: string, payload: IBookmarkDocument) {
        const bookmark = await Bookmark.find(id)
        return await await bookmark?.delete();
    }
}

