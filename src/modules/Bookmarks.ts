
import { FieldType } from "soukai";
import { SolidModel, defineSolidModelSchema, SolidSchemaDefinition } from "soukai-solid";


export interface IBookmark {
    title: string
    link: string
}

export class Bookmark extends SolidModel {

    static rdfContexts = {
        'bookm': 'http://www.w3.org/2002/01/bookmark#',
        'dct': 'http://purl.org/dc/terms/',
    };

    static rdfsClasses = ['bookm:Bookmark'];

    static fields = {
        title: {
            type: FieldType.String,
            rdfProperty: 'dct:title',
        },
        link: {
            type: FieldType.String,
            rdfProperty: 'bookm:recalls',
        },
    };
}
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


// (async () => {
//     const containerUrl = 'https://soltanireza65.solidcommunity.net/bookmark/';

//     const persons = await Bookmark.from(containerUrl).all();

//     const person = await Bookmark.at(containerUrl).create({ name: 'Amy Doe' });
// })()


// const PersonSchema = defineSolidModelSchema({
//     rdfContexts: {
//         'bookm': 'http://www.w3.org/2002/01/bookmark#',
//         'dct': 'http://purl.org/dc/terms/',
//     },
//     rdfsClass: 'bookm:Bookmark',
//     timestamps: false,
//     fields: {
//         title: {
//             type: FieldType.String,
//             rdfProperty: 'dct:title',
//         },
//         link: {
//             type: FieldType.String,
//             rdfProperty: 'bookm:recalls',
//         },
//     },
// });

// class PersonModel extends PersonSchema {
//     public friends?: Person[];
//     public group?: Group;
//     public relatedFriends!: SolidBelongsToManyRelation<Person, Person, typeof Person>;
//     public relatedStarredMovies!: SolidBelongsToManyRelation<Person, Movie, typeof Movie>;

//     public friendsRelationship(): Relation {
//         return this.belongsToMany(Person, 'friendUrls');
//     }

//     public groupRelationship(): Relation {
//         return this.hasOne(Group, 'memberUrls');
//     }

//     public starredMovies(): Relation {
//         return this.belongsToMany(Movie, 'starred');
//     }

//     protected newUrl(documentUrl?: string, resourceHash?: string): string {
//         if (this.name && documentUrl && resourceHash !== this.static('defaultResourceHash')) {
//             return `${documentUrl}#${stringToSlug(this.name)}`;
//         }

//         return super.newUrl(documentUrl, resourceHash);
//     }

// }


// new PersonModel({})
// new PersonSchema({})

