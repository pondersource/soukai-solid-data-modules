// import { loadFixture } from "@/testing/utils";
import { readFileSync } from "fs";
import { bootModels, setEngine } from "soukai";
import { SolidEngine } from "soukai-solid";
import { Bookmark } from "../modules/Bookmarks";
import StubFetcher from "../utils/StubFetcher";
import { tap, urlResolve, urlResolveDirectory } from '@noeldemartin/utils';
import RDFDocument from "@/solid/RDFDocument";
import RDFResourceProperty from "@/solid/RDFResourceProperty";
// import RDFDocument from "soukai-solid/src/solid/RDFDocument"
// import RDFResourceProperty from "soukai-solid/src/solid/RDFResourceProperty"

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
    StubFetcher.addFetchResponse(fixture('google.ttl'), {
      'WAC-Allow': 'public="read"',
    });

    // Act
    const bookmark = await Bookmark.find('solid://bookmarks/google#it') as Bookmark;
    console.log(bookmark.link);

    // Assert
    expect(bookmark).toBeInstanceOf(Bookmark);
    expect(bookmark.url).toEqual('solid://bookmarks/google#it');
    expect(bookmark.label).toEqual(label);
    expect(bookmark.topic).toEqual(topic);
    expect(bookmark.link).toEqual(link);
  });

  it('Updates models', async () => {
    const label = "Google";
    const topic = "Search Engine";
    const link = "https://google.com";

    const date = new Date('2023-01-01:00:00Z')

    // Arrange
    // const title = faker.lorem.sentence();
    const stub = await createStub({
      label,
      link,
      topic
    });

    const bookmark = new Bookmark(stub.getAttributes(), true);

    StubFetcher.addFetchResponse();

    // // Act
    bookmark.setAttribute('label', label);
    bookmark.setAttribute('link', link);
    bookmark.setAttribute('topic', topic);

    bookmark.metadata.createdAt = date
    bookmark.metadata.updatedAt = date

    await bookmark.save();

    // // Assert
    expect(bookmark.label).toBe(label);
    expect(fetch).toHaveBeenCalledTimes(2);


    expect(fetch.mock.calls[1]?.[1]?.body).toEqualSparql(`
      DELETE DATA { 
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> . 
      };
      INSERT DATA { 
        <#it-metadata> a <https://vocab.noeldemartin.com/crdt/Metadata> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/createdAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/resource> <#it> .
        <#it-metadata> <https://vocab.noeldemartin.com/crdt/updatedAt> "2023-01-01T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> . 
      }
    `);
  });

  it('Reads many models from containers', async () => {
    const label = "Google";
    const topic = "Search Engine";
    const link = "https://google.com";

    // Arrange
    StubFetcher.addFetchResponse(fixture('google.ttl'), {
      'WAC-Allow': 'public="read"',
    });
    StubFetcher.addFetchResponse(fixture('bing.ttl'), {
      'WAC-Allow': 'public="read"',
    });

    // Act
    const bookmark = await Bookmark.at('solid://bookmarks/').all() as Bookmark[];
    console.log(bookmark);

    // Assert
    // expect(bookmark).toBeInstanceOf(Bookmark);
    // expect(bookmark.url).toEqual('solid://bookmarks/google#it');
    // expect(bookmark.label).toEqual(label);
    // expect(bookmark.topic).toEqual(topic);
    // expect(bookmark.link).toEqual(link);



    // Arrange
    // StubFetcher.addFetchResponse(fixture('google.ttl'));
    // StubFetcher.addFetchResponse(fixture('bing.ttl'));

    // // Act
    // // const bookmarks = await Bookmark.all({ rating: 'PG' });
    // const bookmarks = await Bookmark.all();

    // console.log(bookmarks);
    
    // // Assert
    // expect(bookmarks).toHaveLength(2);
    // const theTaleOfPrincessKaguya = bookmarks.find(bookmark => bookmark.url.endsWith('the-tale-of-princess-kaguya#it')) as Bookmark;
    // const spiritedAway = bookmarks.find(bookmark => bookmark.url.endsWith('spirited-away#it')) as Bookmark;

    // expect(theTaleOfPrincessKaguya).not.toBeUndefined();
    // expect(theTaleOfPrincessKaguya.label).toEqual('The Tale of The Princess Kaguya');
    // // expect(theTaleOfPrincessKaguya.actions).toHaveLength(0);

    // expect(spiritedAway).not.toBeUndefined();
    // expect(spiritedAway.label).toEqual('Spirited Away');
    // expect(spiritedAway.actions).toHaveLength(1);
  });

});


async function createStub(attributes: {
  label: string
  link: string,
  topic: string,
}): Promise<Bookmark> {

  return tap(new Bookmark(attributes, true), async (stub) => {
    stub.mintUrl();
    stub.cleanDirty();

    const document = await RDFDocument.fromJsonLD(stub.toJsonLD());
    const turtle = RDFResourceProperty.toTurtle(
      document.properties,
      document.url,
    );

    StubFetcher.addFetchResponse(turtle);
  });
}