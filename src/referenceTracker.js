// @flow

import type { ReferenceMapType } from "./types";

export function getReferencesTo(
  referenceMap: ReferenceMapType<*>,
  toEntity: string
) {
  return referenceMap[toEntity] || {};
}

export function addReference(
  referenceMap: ReferenceMapType<*>,
  fromEntity: string,
  toEntity: string,
  metaData?: mixed = null
) {
  return {
    ...referenceMap,
    [toEntity]: {
      ...referenceMap[toEntity],
      [fromEntity]: metaData
    }
  };
}

export function deleteReference(
  referenceMap: ReferenceMapType<*>,
  fromEntity: string,
  toEntity: string
) {
  const newReferencesToEntity = {
    ...referenceMap[toEntity]
  };

  delete newReferencesToEntity[fromEntity];

  return {
    ...referenceMap,
    [toEntity]: newReferencesToEntity
  };
}
