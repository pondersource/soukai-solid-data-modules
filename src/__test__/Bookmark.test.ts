// import { loadFixture } from "@/testing/utils";
import { readFileSync } from "fs";
import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { Bookmark } from "../modules/Bookmarks";
import StubFetcher from "../utils/StubFetcher";

export function loadFixture<T = string>(name: string): T {
  const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();

  return /\.json(ld)$/.test(name)
    ? JSON.parse(raw)
    : raw;
}

const fixture = (name: string) => loadFixture(`bookmarks/${name}`);


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
    const topic = "Search Engine";
    const link = "https://google.com";

    const date = new Date('2023-01-01:00:00Z')


    StubFetcher.addFetchResponse();
    StubFetcher.addFetchResponse();

    // Act
    const bookmark = new Bookmark({ title, topic, link });

    bookmark.metadata.createdAt = date
    bookmark.metadata.updatedAt = date

    await bookmark.save();

    // Assert
    expect(fetch).toHaveBeenCalledTimes(2);


    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
      INSERT DATA { 
        <#it> a <http://www.w3.org/2002/01/bookmark#Bookmark> .
        <#it> <http://www.w3.org/2002/01/bookmark#hasTopic> "Search Engine" .
        <#it> <http://www.w3.org/2002/01/bookmark#recalls> <https://google.com> .
        <#it> <http://www.w3.org/2002/01/bookmark#title> "Google" .
        <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> . 
      }
    `);
  });


  it('Reads single models', async () => {
    const label = "Google";
    const topic = "Search Engine";
    const link = "https://google.com";

    // Arrange
    StubFetcher.addFetchResponse(fixture('index.ttl'), {
      'WAC-Allow': 'public="read"',
    });

    // Act
    const bookmark = await Bookmark.find('solid://bookmarks/index#it') as Bookmark;
    console.log(bookmark.link);

    // Assert
    expect(bookmark).toBeInstanceOf(Bookmark);
    expect(bookmark.url).toEqual('solid://bookmarks/index#it');
    expect(bookmark.label).toEqual(label);
    expect(bookmark.topic).toEqual(topic);
    expect(bookmark.link).toEqual(link);
  });
});