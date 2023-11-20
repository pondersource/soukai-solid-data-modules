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

    it("fetches the public type index", async () => {
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

    it("fetches the private type index", async () => {
        stubFetcher.addFetchResponse(loadFixture("card.ttl"), {
            "WAC-Allow": 'public="read"',
        });
        const args = {
            webId: "https://fake-pod.com/profile/card#me",
            fetch,
            typePredicate: "solid:privateTypeIndex",
        };
        const result = await getTypeIndexFromProfile(args as any);
        // console.log("🚀 ~ file: typeIndexHelpers.test.ts:22 ~ it ~ result:", result)
        expect(result).toBe("https://fake-pod.com/settings/privateTypeIndex.ttl");
    });

    it("registers instance In TypeIndex", async () => {

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
        expect(fetch).toHaveBeenCalledTimes(2);

        expect(result.forClass).toEqual(forClass);
        expect(result.instanceContainer).toEqual(instanceContainer);
    })
    it("Creates public typeIndex document", async () => {

        // Arrange
        const webId = "https://fake-pod.com/profile/card#me"

        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();

        // Act
        const result = await createTypeIndex(webId, "public", fetch)

        // Assert
        expect(result?.url).toEqual("https://fake-pod.com/settings/publicTypeIndex.ttl");

        expect(fetch).toHaveBeenCalledTimes(2);
    })
    it("Creates private typeIndex document", async () => {

        // Arrange
        const webId = "https://fake-pod.com/profile/card#me"

        stubFetcher.addFetchResponse();
        stubFetcher.addFetchResponse();

        // Act
        const result = await createTypeIndex(webId, "private", fetch)

        // Assert
        expect(result?.url).toEqual("https://fake-pod.com/settings/privateTypeIndex.ttl");

        expect(fetch).toHaveBeenCalledTimes(2);
    })
});