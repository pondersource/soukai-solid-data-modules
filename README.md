# Soukai Solid Utils

Some utils for use in combination with [Soukai-Solid](https://github.com/NoelDeMartin/soukai-solid).

```
npm install
npm test
npm run build
```

## Functions provided
### getTypeIndexFromProfile
Finds the URL of one of the type indexes, given the URL of the profile document.
Returns a string or throws an error, namely:
FIXME: Complete this list and create a unit test for each of them, ref https://github.com/pondersource/soukai-solid-utils/issues/17
If the webId URL is malformed then ...
If the profile document cannot be retrieved, then ...
If fetching the profile document times out based on the timeout of the Fetch function (?), then ...
If the profile document is not valid JSON-LD then ...
If the profile document does not contain a link to a type index of the requested type then ...

Example usage:
```
const args = {
    webId: "https://michielbdejong.solidcommunity.net/profile/card#me",
    // fetch: {}, FIXME: https://github.com/pondersource/soukai-solid-utils/issues/17
    typePredicate: "solid:publicTypeIndex",
};
const result = await getTypeIndexFromProfile(args as any);
expect(result).toBe("https://michielbdejong.solidcommunity.net/settings/publicTypeIndex.ttl");
```