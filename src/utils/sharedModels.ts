import {
  AddPropertyOperation,
  DeleteOperation,
  Metadata,
  Operation,
  PropertyOperation,
  RemovePropertyOperation,
  SetPropertyOperation,
  SolidACLAuthorization,
  SolidContainer,
  SolidDocument,
  SolidEngine,
  SolidTypeIndex,
  SolidTypeRegistration,
  Tombstone,
  UnsetPropertyOperation,
} from "soukai-solid";

export const sharedModels = {
  Metadata: Metadata,
  Operation: Operation,
  PropertyOperation: PropertyOperation,
  AddPropertyOperation: AddPropertyOperation,
  RemovePropertyOperation: RemovePropertyOperation,
  DeleteOperation: DeleteOperation,
  SetPropertyOperation: SetPropertyOperation,
  Tombstone: Tombstone,
  UnsetPropertyOperation: UnsetPropertyOperation,
  SolidACLAuthorization: SolidACLAuthorization,
  SolidContainer: SolidContainer,
  SolidDocument: SolidDocument,
  SolidTypeIndex: SolidTypeIndex,
  SolidTypeRegistration: SolidTypeRegistration,
};
