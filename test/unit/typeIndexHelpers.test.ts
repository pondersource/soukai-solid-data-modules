import {
    getTypeIndexFromProfile,
    registerInTypeIndex,
    createTypeIndex,
} from "../../src/typeIndexHelpers";
import stubFetcher from '../../src/StubFetcher'
import { readFileSync } from "fs";
import { SolidEngine, SolidTypeRegistration } from "soukai-solid";
import { setEngine } from "soukai";


function loadFixture<T = string>(name: string): T {
    const raw = readFileSync(`${__dirname}/fixtures/${name}`).toString();
    return /\.json(ld)$/.test(name) ? JSON.parse(raw) : raw;
}

describe("getTypeIndexFromProfile", () => {

    let fetch: jest.Mock<Promise<Response>, [RequestInfo, RequestInit?]>;

    beforeEach(() => {
        stubFetcher.fetchSpy = jest.spyOn(stubFetcher, 'fetch');

        fetch = jest.fn((...args) => stubFetcher.fetch(...args));

        setEngine(new SolidEngine(fetch));
    });

    it("fetches the public type index URL", async () => {
        // Arrange
        stubFetcher.addFetchResponse(loadFixture("card.ttl"), {
            "WAC-Allow": 'public="read"',
        });

        const args = {
            webId: "https://fake-pod.com/profile/card#me",
            fetch,
            typePredicate: "solid:publicTypeIndex",
        };

        const result = await getTypeIndexFromProfile(args as any);
        expect(result).toBe("https://fake-pod.com/settings/publicTypeIndex.ttl");
    });

    it("fetches the private type index URL", async () => {
        stubFetcher.addFetchResponse(loadFixture("card.ttl"), {
            "WAC-Allow": 'public="read"',
        });
        const args = {
            webId: "https://fake-pod.com/profile/card#me",
            fetch,
            typePredicate: "solid:privateTypeIndex",
        };
        const result = await getTypeIndexFromProfile(args as any);
        expect(result).toBe("https://fake-pod.com/settings/privateTypeIndex.ttl");
    });

    it("registers instanceContainer In TypeIndex", async () => {

        // Arrange
        SolidTypeRegistration.collection = "https://fake-pod.com/settings/";

        const forClass = "http://www.w3.org/2002/01/bookmark#Bookmark"
        const instanceContainer = "https://solid-dm.solidcommunity.net/bookmarks/"
        const typeIndexUrl = "https://fake-pod.com/settings/privateTypeIndex.ttl"


        // Act
        // calling this twise because soukai-solid first calls a GET request and then a PATCH always
        // (maybe this can count as a problem with soukai)
        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();

        const result = await registerInTypeIndex({ forClass, instanceContainer, typeIndexUrl })


        // Assert
        // expect(fetch).toHaveBeenCalledTimes(2);
        expect(fetch).toHaveBeenCalledWith(typeIndexUrl, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('INSERT DATA { <'), headers: expect.objectContaining({ 'Content-Type': 'application/sparql-update' }) }));
        expect(fetch).toHaveBeenCalledWith(typeIndexUrl, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('> a <http://www.w3.org/ns/solid/terms#TypeRegistration> .') }));
        expect(fetch).toHaveBeenCalledWith(typeIndexUrl, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('> <http://www.w3.org/ns/solid/terms#forClass> <http://www.w3.org/2002/01/bookmark#Bookmark> .') }));
        expect(fetch).toHaveBeenCalledWith(typeIndexUrl, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('> <http://www.w3.org/ns/solid/terms#instanceContainer> <https://solid-dm.solidcommunity.net/bookmarks/> . }') }));
        expect(result.forClass).toEqual(forClass);
        expect(result.instanceContainer).toEqual(instanceContainer);
    })
    it("Creates public typeIndex document", async () => {

        // Arrange
        const webId = "https://fake-pod.com/profile/card#me"
        const expectedTypeIndexUrl = "https://fake-pod.com/settings/publicTypeIndex.ttl"

        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();

        // Act
        const result = await createTypeIndex(webId, "public", fetch)

        // Assert
        expect(result?.url).toEqual(expectedTypeIndexUrl);

        // expect(fetch).toHaveBeenCalledTimes(2);
        // adding the link into the profile
        expect(fetch).toHaveBeenCalledWith(webId, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('INSERT DATA {'), headers: expect.objectContaining({ 'Content-Type': 'application/sparql-update' }) }));
        expect(fetch).toHaveBeenCalledWith(webId, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('<https://fake-pod.com/profile/card#me> <http://www.w3.org/ns/solid/terms#publicTypeIndex> <https://fake-pod.com/settings/publicTypeIndex.ttl> .') }));

        // create the typeIndex document
        expect(fetch).toHaveBeenCalledWith(expectedTypeIndexUrl, expect.objectContaining({ method: 'PUT', body: '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .', headers: expect.objectContaining({ 'Content-Type': 'text/turtle' }) }));

    })
    it("Creates private typeIndex document", async () => {

        // Arrange
        const webId = "https://fake-pod.com/profile/card#me"
        const expectedTypeIndexUrl = "https://fake-pod.com/settings/privateTypeIndex.ttl"


        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();

        // Act
        const result = await createTypeIndex(webId, "private", fetch)

        // Assert
        expect(result?.url).toEqual(expectedTypeIndexUrl);

        // expect(fetch).toHaveBeenCalledTimes(2);
        // adding the link into the profile
        expect(fetch).toHaveBeenCalledWith(webId, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('INSERT DATA {'), headers: expect.objectContaining({ 'Content-Type': 'application/sparql-update' }) }));
        expect(fetch).toHaveBeenCalledWith(webId, expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('<https://fake-pod.com/profile/card#me> <http://www.w3.org/ns/solid/terms#privateTypeIndex> <https://fake-pod.com/settings/privateTypeIndex.ttl> .') }));

        // create the typeIndex document
        expect(fetch).toHaveBeenCalledWith(expectedTypeIndexUrl, expect.objectContaining({ method: 'PUT', body: expect.stringContaining('<> a'), headers: expect.objectContaining({ 'Content-Type': 'text/turtle' }) }));
        expect(fetch).toHaveBeenCalledWith(expectedTypeIndexUrl, expect.objectContaining({ method: 'PUT', body: expect.stringContaining('<http://www.w3.org/ns/solid/terms#TypeIndex>,') }));
        expect(fetch).toHaveBeenCalledWith(expectedTypeIndexUrl, expect.objectContaining({ method: 'PUT', body: expect.stringContaining('<http://www.w3.org/ns/solid/terms#UnlistedDocument> .') }));

    })
});