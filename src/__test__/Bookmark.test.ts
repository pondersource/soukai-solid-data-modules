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

    const res = await bookmark.save();
    console.log("🚀 ~ file: Bookmark.test.ts:35 ~ it ~ res:", res)

    // Assert
    expect(fetch).toHaveBeenCalledTimes(2);

    console.log("🚀 ~ file: Bookmark.test.ts:39 ~ it ~ fetch.mock.calls[1]?.[1]?.body:", fetch.mock.calls[1]?.[1]?.body)

    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql

    // expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
    //   INSERT DATA {
    //     @prefix : <#>.
    //     @prefix dct: <http://purl.org/dc/terms/>.
    //     @prefix bookm: <http://www.w3.org/2002/01/bookmark#>.

    //     <#it> a bookm:Bookmark .
    //     <#it> dct:title "google";
    //     <#it> bookm:recalls <https://google.com>.
    //   }
    // `);
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
