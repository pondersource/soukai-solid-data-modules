
import { FieldType, TimestampField } from "soukai";
import { defineSolidModelSchema } from "soukai-solid";
import { ISoukaiDocumentBase } from "../shared/contracts";


export type ICreateBookmark = {
    title: string
    link: string
}

export type IBookmark = ISoukaiDocumentBase & ICreateBookmark

export const BookmarkSchema = defineSolidModelSchema({
    rdfContexts: {
        'bookm': 'http://www.w3.org/2002/01/bookmark#',
    },
    rdfsClasses: ['bookm:Bookmark'],
    timestamps: [TimestampField.CreatedAt],
    fields: {
        title: {
            type: FieldType.String,
            rdfProperty: 'purl:title',
        },
        link: {
            type: FieldType.Key,
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
        return await Bookmark.from(this.containerUrl).all();
    }

    async get(id: string) {
        return await Bookmark.find(id);
    }

    async create(payload: ICreateBookmark) {
        const bookmark = new Bookmark(payload);
        return await bookmark.save(this.containerUrl);
    }

    async update(id: string, payload: IBookmark) {
        const bookmark = await Bookmark.find(id);
        return await bookmark?.update(payload);
    }

    async remove(id: string) {
        const bookmark = await Bookmark.find(id);
        return await bookmark?.delete();
    }
}
