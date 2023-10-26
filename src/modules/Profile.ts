import { FieldType, TimestampField } from "soukai";
import { SolidContainer, defineSolidModelSchema } from "soukai-solid";
import { ISoukaiDocumentBase } from "../shared/contracts";
import {
  createTypeIndex,
  getTypeIndexFromPofile,
  registerInTypeIndex,
} from "../utils/typeIndexHelpers";
import { GetInstanceArgs } from "../types";

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

export class Profile extends ProfileSchema {}

export class ProfileFactory {
  private static instance: ProfileFactory;

  private constructor(private containerUrl: string) {}

  public static async getInstance(
    args?: GetInstanceArgs,
    containerUrl?: string
  ): Promise<ProfileFactory> {
    if (!ProfileFactory.instance) {
      try {
        const baseURL = args?.webId.split("profile")[0]; // https://example.solidcommunity.net/

        containerUrl = `${baseURL}${containerUrl ?? "bookmarks/"}`.replace(
          "//",
          "/"
        ); // normalize url

        let _containerUrl = "";

        const typeIndexUrl = await getTypeIndexFromPofile({
          webId: args?.webId ?? "",
          fetch: args?.fetch,
          typePredicate: args?.typePredicate ?? "solid:privateTypeIndex",
        });

        if (typeIndexUrl) {
          const _container = await SolidContainer.fromTypeIndex(
            typeIndexUrl,
            Profile
          );
          if (!_container) {
            _containerUrl = containerUrl ?? baseURL + "bookmarks/";

            await registerInTypeIndex({
              forClass: Profile.rdfsClasses[0],
              instanceContainer: _containerUrl,
              typeIndexUrl: typeIndexUrl,
            });
          } else {
            _containerUrl = _container?.url ?? "";
          }
        } else {
          // Create TypeIndex
          const typeIndexUrl = await createTypeIndex(
            args?.webId!,
            "private",
            args?.fetch
          );
          _containerUrl = containerUrl ?? baseURL + "bookmarks/";

          // add containerUrl to typeIndex
          // TODO: it inserts two instances
          await registerInTypeIndex({
            forClass: Profile.rdfsClasses[0],
            instanceContainer: _containerUrl,
            typeIndexUrl: typeIndexUrl,
          });
        }

        ProfileFactory.instance = new ProfileFactory(_containerUrl);
      } catch (error: any) {
        console.log(error.message);
      }
    }
    return ProfileFactory.instance;
  }

  async getAll() {
    return await Profile.from(this.containerUrl).all();
  }

  async get(id: string) {
    return await Profile.from(this.containerUrl).find(id);
  }

  async create(payload: ICreateProfile) {
    const profile = new Profile(payload);
    return await profile.save(this.containerUrl);
  }

  async update(id: string, payload: IProfile) {
    const profile = await Profile.find(id);
    return await profile?.update(payload);
  }

  async remove(id: string) {
    const profile = await Profile.find(id);
    return await profile?.delete();
  }
}
