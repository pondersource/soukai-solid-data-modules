import { FieldType } from "soukai";
import { SolidContainer, SolidModel, defineSolidModelSchema } from "soukai-solid";
import { ISoukaiDocumentBase } from "../shared/contracts";
import { GetInstanceArgs } from "../types";
import {
  createTypeIndex,
  fromTypeIndex,
  getTypeIndexFromPofile,
  registerInTypeIndex,
} from "../utils/typeIndexHelpers";

export type ICreateProfile = {
  name: string;
  "organization-name": string;
  hasEmail: string;
  bday: string;
  hasTelephone: string;
};

export type IProfile = ISoukaiDocumentBase & ICreateProfile;

export const ProfileSchema = defineSolidModelSchema({
  rdfContexts: {
    dct: "http://purl.org/dc/terms/",
    ns: "http://www.w3.org/2006/vcard/ns#",
  },
  rdfsClasses: ["foaf:Person", "schema:Person"],
  fields: {
    name: { type: FieldType.String, rdfProperty: "foaf:name" },
    "organization-name": {
      type: FieldType.String,
      rdfProperty: "ns:organization-name",
    },
    hasEmail: { type: FieldType.String, rdfProperty: "ns:hasEmail" },
    bday: { type: FieldType.String, rdfProperty: "ns:bday" },
    hasTelephone: { type: FieldType.String, rdfProperty: "ns:hasTelephone" },
  },
});

export class Profile extends ProfileSchema { }

export class ProfileFactory {
  private static instance: ProfileFactory;

  private constructor(private containerUrls: string[] = []) { }

  public static async getInstance(args?: GetInstanceArgs, defaultContainerUrl?: string): Promise<ProfileFactory> {
    if (!ProfileFactory.instance) {
      try {
        const baseURL = args?.webId.split("profile")[0] // https://example.solidcommunity.net/

        defaultContainerUrl = `${baseURL}${defaultContainerUrl ?? "bookmarks/"}` //.replace("//", "/") // normalize url

        console.log("🚀 ~ file: Bookmarks.ts:57 ~ BookmarkFactory ~ getInstance ~ defaultContainerUrl:", defaultContainerUrl)
        let _containerUrls: string[] = []

        const typeIndexUrl = await getTypeIndexFromPofile({
          webId: args?.webId ?? "",
          fetch: args?.fetch,
          typePredicate: args?.typePredicate ?? "solid:privateTypeIndex"
        })

        if (typeIndexUrl) {
          const res = await fromTypeIndex(typeIndexUrl, Profile)
          console.log("🚀 ~ file: Bookmarks.ts:70 ~ BookmarkFactory ~ getInstance ~ res:", res?.map(c => c.url))

          const _containers = await SolidContainer.fromTypeIndex(typeIndexUrl, Profile)
          console.log("🚀 ~ file: Bookmarks.ts:68 ~ BookmarkFactory ~ getInstance ~ _containers:", _containers.map(c => c.url))

          if (!_containers || !_containers.length) {

            _containerUrls.push(defaultContainerUrl)

            await registerInTypeIndex({
              forClass: Profile.rdfsClasses[0],
              instanceContainer: _containerUrls[0],
              typeIndexUrl: typeIndexUrl,
            });

          } else {
            _containerUrls = [..._containerUrls, ..._containers.map(c => c.url)]
          }
        } else {
          // Create TypeIndex
          const typeIndexUrl = await createTypeIndex(args?.webId!, "private", args?.fetch)
          _containerUrls.push(defaultContainerUrl)

          // TODO: it inserts two instances
          await registerInTypeIndex({
            forClass: Profile.rdfsClasses[0],
            instanceContainer: _containerUrls[0],
            typeIndexUrl: typeIndexUrl,
          });
        }

        ProfileFactory.instance = new ProfileFactory(_containerUrls);

      } catch (error: any) {
        console.log(error.message);
      }
    }
    return ProfileFactory.instance;
  }

  async getAll() {
    const promises = this.containerUrls.map(c => Profile.from(c).all())

    const allPromise = Promise.all(promises);

    try {
      const values = (await allPromise).flat();
      return values
    } catch (error) {
      console.log(error);
      return [] as (Profile & SolidModel)[]
    }

    // return await Bookmark.from(this.containerUrl).all();
  }

  async get(id: string) {
    const promises = this.containerUrls.map(c => Profile.from(c).find(id))
    const allPromise = Promise.all(promises);
    try {
      const values = (await allPromise).flat();

      return values[0]

    } catch (error) {
      console.log(error);
      return undefined
    }
    // return await Bookmark.from(this.containerUrl).find(id);
  }

  async create(payload: ICreateProfile) {
    const bookmark = new Profile(payload);
    return await bookmark.save(this.containerUrls[0]);
  }

  async update(id: string, payload: IProfile) {
    const promises = this.containerUrls.map(c => Profile.from(c).find(id))
    const allPromise = Promise.all(promises);
    try {
      const values = (await allPromise).flat();

      return values.map(v => v?.update(payload))

    } catch (error) {
      console.log(error);
      return undefined
    }


    // const bookmark = await Bookmark.from(this.containerUrl).find(id)
    // return await bookmark?.update(payload);
  }

  async remove(id: string) {
    const promises = this.containerUrls.map(c => Profile.from(c).find(id))
    const allPromise = Promise.all(promises);
    try {
      const values = (await allPromise).flat();

      return values.map(async (v) => await v?.delete())

    } catch (error) {
      console.log(error);
      return undefined
    }

    // const bookmark = await Bookmark.from(this.containerUrl).find(id)
    // return await bookmark?.delete();
  }
}
