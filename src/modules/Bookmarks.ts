
import { FieldType } from "soukai";
import { SolidModel } from "soukai-solid";


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