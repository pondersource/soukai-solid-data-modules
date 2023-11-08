import { faker } from "@noeldemartin/faker";
import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { Bookmark } from "../modules/Bookmarks";
import { sharedModels } from "../utils/sharedModels";
import StubFetcher from "../utils/StubFetcher";

describe("Solid CRUD", () => {
  let fetch: jest.Mock<Promise<Response>, [RequestInfo, RequestInit?]>;

  beforeEach(() => {
    fetch = jest.fn((...args) => StubFetcher.fetch(...args));
    Bookmark.collection = "https://my-pod.com/bookmarks/";

    setEngine(new SolidEngine(fetch));
    bootModels({
      ...sharedModels,
      Bookmark: Bookmark,
    });
  });

  it("Creates models", async () => {
    // Arrange
    const title = faker.lorem.sentence();
    const link = "https://google.com";

    StubFetcher.addFetchResponse();
    StubFetcher.addFetchResponse();

    // Act
    const bookmark = new Bookmark({ title, link });

    await bookmark.save();

    // Assert
    expect(fetch).toHaveBeenCalledTimes(2);

    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
      INSERT DATA {
        <#it-metadata> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://vocab.noeldemartin.com/crdt/Metadata> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> \"2023-11-08T11:19:45.858Z\"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> \"2023-11-08T11:19:45.858Z\"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://google.com> .
        <#it> <http://www.w3.org/2002/01/bookmark#title> \"Tenetur minus porro eaque assumenda.\" .
      }
    `);
  });
});

// async function createStub(title?: string): Promise<Movie> {
//   const attributes = {
//     title: title ?? faker.lorem.sentence(),
//     externalUrls: ["https://example.org/foo", "https://example.org/bar"],
//     releaseDate: new Date(),
//   };

//   return tap(new Movie(attributes, true), async (stub) => {
//     stub.mintUrl();
//     stub.cleanDirty();

//     const document = await RDFDocument.fromJsonLD(stub.toJsonLD());
//     const turtle = RDFResourceProperty.toTurtle(
//       document.properties,
//       document.url
//     );

//     StubFetcher.addFetchResponse(turtle);
//   });
// }
