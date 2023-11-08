import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { Bookmark } from "../modules/Bookmarks";
import StubFetcher from "../utils/StubFetcher";

describe("Bookmark CRUD", () => {
  let fetch: jest.Mock<Promise<Response>, [RequestInfo, RequestInit?]>;

  beforeEach(() => {
    fetch = jest.fn((...args) => StubFetcher.fetch(...args));
    Bookmark.collection = "https://fake-pod.com/bookmarks/";

    setEngine(new SolidEngine(fetch));
    bootModels({
      Bookmark: Bookmark,
    });
  });

  it("Creates models", async () => {
    // Arrange
    const title = "Google";
    const topic = "SearchEngines";
    const link = "https://google.com";

    const date = new Date('2023-01-01:00:00Z')

    // console.log("now", now);

    StubFetcher.addFetchResponse();
    StubFetcher.addFetchResponse();

    // Act
    const bookmark = new Bookmark({ title, topic, link });

    bookmark.metadata.createdAt = date
    bookmark.metadata.updatedAt = date

    await bookmark.save();

    // Assert
    expect(fetch).toHaveBeenCalledTimes(2);

    // console.log("", fetch.mock.calls[1]?.[1]?.body)


    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
      INSERT DATA { 
        <#it> a <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <#it> <http://www.w3.org/2002/01/bookmark#hasTopic> "SearchEngines" .
        <#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://google.com> .
        <#it> <http://www.w3.org/2002/01/bookmark#title> "Google" .
        <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> . 
      }
    `);
  });
});