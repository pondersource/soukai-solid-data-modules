import { FieldType } from "soukai";
import {
  defineSolidModelSchema,
  SolidContainer,
  SolidDocument,
  SolidModel,
} from "soukai-solid";
import { v4 } from "uuid";
import { ISoukaiDocumentBase } from "../shared/contracts";
import { GetInstanceArgs } from "../types";
import {
  createTypeIndex,
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

export class Profile extends ProfileSchema {}

export class ProfileFactory {
  private static instance: ProfileFactory;

  private constructor(
    private containerUrls: string[] = [],
    private instancesUrls: string[] = []
  ) {}

  public static async getInstance(
    args?: GetInstanceArgs,
    defaultContainerUrl?: string
  ): Promise<ProfileFactory> {
    if (!ProfileFactory.instance) {
      try {
        const baseURL = args?.webId.split("profile")[0]; // https://example.solidcommunity.net/

        defaultContainerUrl = `${baseURL}${
          defaultContainerUrl ?? "bookmarks/"
        }`;

        let _containerUrls: string[] = [];
        let _instancesUrls: string[] = [];

        const typeIndexUrl = await getTypeIndexFromPofile({
          webId: args?.webId ?? "",
          fetch: args?.fetch,
          typePredicate: args?.isPrivate
            ? "solid:privateTypeIndex"
            : "solid:publicTypeIndex",
        });

        if (typeIndexUrl) {
          // const res = await fromTypeIndex(typeIndexUrl, Bookmark)

          const _containers = await SolidContainer.fromTypeIndex(
            typeIndexUrl,
            Profile
          );

          if (!_containers || !_containers.length) {
            _containerUrls.push(defaultContainerUrl);

            await registerInTypeIndex({
              forClass: Profile.rdfsClasses[0],
              instanceContainer: _containerUrls[0],
              typeIndexUrl: typeIndexUrl,
            });
          } else {
            _containerUrls = [
              ..._containerUrls,
              ..._containers.map((c) => c.url),
            ];
          }

          const _instances = await SolidDocument.fromTypeIndex(
            typeIndexUrl,
            Profile
          );

          if (_instances.length) {
            _instancesUrls = [
              ..._instancesUrls,
              ..._instances.map((c) => c.url),
            ];
          }
        } else {
          // Create TypeIndex
          const typeIndexUrl = await createTypeIndex(
            args?.webId!,
            "private",
            args?.fetch
          );
          _containerUrls.push(defaultContainerUrl);

          // TODO: it inserts two instances
          await registerInTypeIndex({
            forClass: Profile.rdfsClasses[0],
            instanceContainer: _containerUrls[0],
            typeIndexUrl: typeIndexUrl,
          });
        }

        ProfileFactory.instance = new ProfileFactory(
          _containerUrls,
          _instancesUrls
        );
      } catch (error: any) {
        console.log(error.message);
      }
    }
    return ProfileFactory.instance;
  }

  async getAll() {
    const containerPromises = this.containerUrls.map((c) =>
      Profile.from(c).all()
    );
    const instancePromises = this.instancesUrls.map((i) =>
      Profile.all({ $in: [i] })
    );

    const allPromise = Promise.all([...containerPromises, ...instancePromises]);

    try {
      const values = (await allPromise).flat();
      return values;
    } catch (error) {
      console.log(error);
      return [] as (Profile & SolidModel)[];
    }
  }

  async get(pk: string) {
    const res = await Profile.findOrFail(pk);

    return res;
  }

  async create(payload: ICreateProfile) {
    const doc = new Profile(payload);
    return await doc.save(this.containerUrls[0]);
  }

  async update(pk: string, payload: IProfile) {
    try {
      const res = await Profile.findOrFail(pk);
      return await res.update(payload);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async remove(pk: string) {
    try {
      const res = await Profile.findOrFail(pk);
      return await res.delete();
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}
