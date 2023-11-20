// import { Fetch} from "soukai-solid";
import { getTypeIndexFromProfile } from "../../src/typeIndexHelpers";

describe("getTypeIndexFromProfile", () => {
    it("fetches the type index", async () => {
        const args = {
            webId: "https://michielbdejong.solidcommunity.net/profile/card#me",
            // fetch: {}, FIXME: https://github.com/pondersource/soukai-solid-utils/issues/17
            typePredicate: "solid:publicTypeIndex",
        };
        const result = await 
        getTypeIndexFromProfile(args as any);
        expect(result).toBe("https://michielbdejong.solidcommunity.net/settings/publicTypeIndex.ttl");
    });
});