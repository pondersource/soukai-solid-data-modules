
import { FieldType, TimestampField } from "soukai";
import { defineSolidModelSchema } from "soukai-solid";


export interface IBookmark {
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

// export class Bookmark extends SolidModel {

//     static rdfContexts = {
//         'bookm': 'http://www.w3.org/2002/01/bookmark#',
//         'dct': 'http://purl.org/dc/terms/',
//     };

//     static rdfsClasses = ['bookm:Bookmark'];

//     static fields = {
//         title: {
//             type: FieldType.String,
//             rdfProperty: 'dct:title',
//         },
//         link: {
//             type: FieldType.String,
//             rdfProperty: 'bookm:recalls',
//         },
//     };
// }
export class BookmarkFactory {
    private static instance: BookmarkFactory;

    private constructor(private containerUrl: string) { }

    public static getInstance(containerUrl: string): BookmarkFactory {
        if (!BookmarkFactory.instance) {
            BookmarkFactory.instance = new BookmarkFactory(containerUrl);
        }

        return BookmarkFactory.instance;
    }

    async create(payload: IBookmark) {
        const bookmark = new Bookmark(payload);
        return await bookmark.save(this.containerUrl);
    }
}


export async function createBookmark(payload: IBookmark, containerUrl: string): Promise<Bookmark> {
    const bookmark = new Bookmark(payload);
    return await bookmark.save(containerUrl);
}

