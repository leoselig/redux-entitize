// @flow

import type { ReferenceMapType } from "./types";

export function getReferencesTo(
  referencesTo: ReferenceMapType<*>,
  entity: string
) {
  return referencesTo[entity] || {};
}

export function addReference(
  referencesTo: ReferenceMapType<*>,
  from: string,
  toEntity: string,
  metaData?: mixed = null
) {
  return {
    ...referencesTo,
    [toEntity]: {
      ...referencesTo[toEntity],
      [from]: metaData
    }
  };
}

export function deleteReference(
  referencesTo: ReferenceMapType<*>,
  from: string,
  toEntity: string
) {
  const newReferencesToEntity = {
    ...referencesTo[toEntity]
  };

  delete newReferencesToEntity[from];

  return {
    ...referencesTo,
    [toEntity]: newReferencesToEntity
  };
}
