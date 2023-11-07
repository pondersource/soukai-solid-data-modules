# Implemented conventions
Implemented conventions

- [Bookmark](https://pdsinterop.org/conventions/bookmark/)

## Usage

### Install and use the package
```bash
npm i soukai-solid-data-modules
```

### Import modules

```ts
import { bootModels, setEngine } from "soukai";
import { SolidEngine, bootSolidModels } from "soukai-solid";

import { Bookmark, BookmarkFactory } from "soukai-solid-data-modules";
```
### Boot Engine
```ts
bootSolidModels();
bootModels({ Bookmark: Bookmark });
```

### get Factory instance (it's a singleton)
```ts
const factory = await BookmarkFactory.getInstance(
    {
        webId: userSession?.info.webId,
        fetch: userSession?.fetch,
        isPrivate: true,
    },
    "bookmarks/" // you can optionally pass a path to override typeRegistration
);
```

### use factory instance to CRUD over bookmarks
```ts
const bookmarks = await bookmarkFactory.getAll();
const bookmark  = await bookmarkFactory.get("149c7283-726f-440f-b13f-4b9d704ac051");
const bookmark  = await bookmarkFactory.create({ title: "example", link: "https://example.com", hasTopic: "" });
const bookmark  = await bookmarkFactory.remove("149c7283-726f-440f-b13f-4b9d704ac051");
const bookmark  = await bookmarkFactory.update("149c7283-726f-440f-b13f-4b9d704ac051", { title: "example", link: "https://example.com" });
```
