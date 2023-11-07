import { Fetch } from "soukai-solid";

export interface GetInstanceArgs {
  webId: string;
  fetch?: Fetch;
  isPrivate?: boolean,
}
