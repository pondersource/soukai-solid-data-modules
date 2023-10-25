
import { createSolidDocument, fetchSolidDocument, updateSolidDocument } from "@noeldemartin/solid-utils";
import { getEngine } from "soukai";
import {
    Fetch,
    SolidTypeRegistration
} from "soukai-solid";
import { v4 } from "uuid";


// export async function getTypeIndexFromPofile(args: { webId: string, fetch?: Fetch, typePredicate: "solid:publicTypeIndex" | "solid:privateTypeIndex" }) {
//     const profile = await fetchSolidDocument(args.webId, args.fetch);

//     const containerQuad = profile.statements(undefined, 'rdf:type', 'http://schema.org/Person')
//         .find((statement) => profile.contains(statement.subject.value, args.typePredicate));

//     return profile.statement(containerQuad?.subject.value, args.typePredicate)?.object.value
// }

// export const registerInTypeIndex = async (args: { instanceContainer: string; forClass: string; typeIndexUrl: string; }) => {
//     const typeRegistration = new SolidTypeRegistration({
//         forClass: args.forClass,
//         instanceContainer: args.instanceContainer,
//     });

//     typeRegistration.mintUrl(args.typeIndexUrl, true, v4());

//     await typeRegistration.withEngine(getEngine()!, () =>
//         typeRegistration.save(urlParentDirectory(args.typeIndexUrl) ?? "")
//     );
// };


// export function urlRoot(url: string): string {
//     const protocolIndex = url.indexOf("://") + 3;
//     const pathIndex = url.substring(protocolIndex).indexOf("/");

//     return pathIndex !== -1 ? url.substring(0, protocolIndex + pathIndex) : url;
// }

// export function urlParentDirectory(url: string): string | null {
//     if (url.endsWith("/")) url = url.substring(0, url.length - 1);

//     if (urlRoot(url) === url) return null;

//     const pathIndex = url.lastIndexOf("/");

//     return pathIndex !== -1 ? url.substring(0, pathIndex + 1) : null;
// }

// type TypeIndexType = 'public' | 'private';







// export async function createTypeIndex(webId: string, type: TypeIndexType, fetch?: Fetch) {

//     const baseURL = webId.split("profile")[0]

//     // fetch = fetch ?? window.fetch.bind(fetch);

//     // const typeIndexUrl = await mintTypeIndexUrl(baseURL, type, fetch);
//     const typeIndexUrl = `${baseURL}settings/${type}TypeIndex.ttl`;

//     const typeIndexBody = type === 'public'
//         ? '<> a <http://www.w3.org/ns/solid/terms#TypeIndex> .'
//         : `
//             <> a
//                 <http://www.w3.org/ns/solid/terms#TypeIndex>,
//                 <http://www.w3.org/ns/solid/terms#UnlistedDocument> .
//         `;
//     const profileUpdateBody = `
//         INSERT DATA {
//             <${webId}> <http://www.w3.org/ns/solid/terms#${type}TypeIndex> <${typeIndexUrl}> .
//         }
//     `;

//     await Promise.all([
//         createSolidDocument(typeIndexUrl, typeIndexBody, fetch),
//         updateSolidDocument(webId, profileUpdateBody, fetch), // https://reza-soltani.solidcommunity.net/profile/card
//     ]);

//     if (type === 'public') {
//         // TODO Implement updating ACLs for the listing itself to public
//     }

//     return typeIndexUrl;
// }



// async function findRegistrations(
//     typeIndexUrl: string,
//     type: string | string[],
//     predicate: string,
//     fetch?: Fetch,
// ): Promise<string[]> {
//     const typeIndex = await fetchSolidDocument(typeIndexUrl, fetch);
//     const types = Array.isArray(type) ? type : [type];

//     return types.map(
//         type => typeIndex
//             .statements(undefined, 'rdf:type', 'solid:TypeRegistration')
//             .filter(statement => typeIndex.contains(statement.subject.value, 'solid:forClass', type))
//             .map(statement => typeIndex.statements(statement.subject.value, predicate))
//             .flat()
//             .map(statement => statement.object.value)
//             .filter(url => !!url),
//     ).flat();
// }

// export async function findContainerRegistrations(
//     typeIndexUrl: string,
//     type: string | string[],
//     fetch?: Fetch,
// ): Promise<string[]> {
//     return findRegistrations(typeIndexUrl, type, 'solid:instanceContainer', fetch);
// }

// export async function findInstanceRegistrations(
//     typeIndexUrl: string,
//     type: string | string[],
//     fetch?: Fetch,
// ): Promise<string[]> {
//     return findRegistrations(typeIndexUrl, type, 'solid:instance', fetch);
// }

