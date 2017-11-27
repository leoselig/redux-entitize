// @flow

import type { ReferencesToType } from "./types";

export function getReferencesTo(
  referencesTo: ReferencesToType,
  entity: string
) {
  return referencesTo[entity] || {};
}

export function addReference(
  referencesTo: ReferencesToType,
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
  referencesTo: ReferencesToType,
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
