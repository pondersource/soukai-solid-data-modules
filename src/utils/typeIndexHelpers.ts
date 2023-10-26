import {
  createSolidDocument,
  fetchSolidDocument,
  updateSolidDocument,
} from "@noeldemartin/solid-utils";
import { getEngine } from "soukai";
import { Fetch, SolidTypeRegistration } from "soukai-solid";
import { v4 } from "uuid";
import { urlParentDirectory } from "./urlHelpers";

export async function getTypeIndexFromPofile(args: {
  webId: string;
  fetch?: Fetch;
  typePredicate: "solid:publicTypeIndex" | "solid:privateTypeIndex";
}) {
  const profile = await fetchSolidDocument(args.webId, args.fetch);

  const containerQuad = profile
    .statements(undefined, "rdf:type", "http://schema.org/Person")
    .find((statement) =>
      profile.contains(statement.subject.value, args.typePredicate)
    );

  return profile.statement(containerQuad?.subject.value, args.typePredicate)
    ?.object.value;
}

export const registerInTypeIndex = async (args: {
  instanceContainer: string;
  forClass: string;
  typeIndexUrl: string;
}) => {
  const typeRegistration = new SolidTypeRegistration({
    forClass: args.forClass,
    instanceContainer: args.instanceContainer,
  });

  typeRegistration.mintUrl(args.typeIndexUrl, true, v4());

  await typeRegistration.withEngine(getEngine()!, () =>
    typeRegistration.save(urlParentDirectory(args.typeIndexUrl) ?? "")
  );
};

export async function createTypeIndex(
  webId: string,
  type: "public" | "private",
  fetch?: Fetch
) {
  const baseURL = webId.split("profile")[0];

  // fetch = fetch ?? window.fetch.bind(fetch);

  // const typeIndexUrl = await mintTypeIndexUrl(baseURL, type, fetch);
  const typeIndexUrl = `${baseURL}settings/${type}TypeIndex.ttl`;

  const typeIndexBody =
    type === "public"
      ? "<> a <http://www.w3.org/ns/solid/terms#TypeIndex> ."
      : `
            <> a
                <http://www.w3.org/ns/solid/terms#TypeIndex>,
                <http://www.w3.org/ns/solid/terms#UnlistedDocument> .
        `;
  const profileUpdateBody = `
        INSERT DATA {
            <${webId}> <http://www.w3.org/ns/solid/terms#${type}TypeIndex> <${typeIndexUrl}> .
        }
    `;

  await Promise.all([
    createSolidDocument(typeIndexUrl, typeIndexBody, fetch),
    updateSolidDocument(webId, profileUpdateBody, fetch), // https://reza-soltani.solidcommunity.net/profile/card
  ]);

  if (type === "public") {
    // TODO Implement updating ACLs for the listing itself to public
  }

  return typeIndexUrl;
}
