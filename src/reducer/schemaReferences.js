// @flow

import { schema } from "normalizr";

import type { SchemaMapType, SchemaReferencesType } from "../types";

// The following set of functions is solely responsible to analyze the static references that
// exist between the different schema types (e.g. this analyzes the fact the `articles` might
// reference entites of the schema `users` via their field `author`)
//
// This is not a reducer – just the logic needed to analyze the normalizr schemas

export function getReferencesForSchema<TSchema: string>(
  schemas: SchemaMapType<TSchema>
): SchemaReferencesType {
  const schemaReferences = {};

  Object.keys(schemas).forEach(referencingSchemaName => {
    const referencingSchema = schemas[referencingSchemaName];

    schemaReferences[referencingSchemaName] = [];

    Object.keys(getNormalizrFieldDefinitions(referencingSchema)).forEach(viaField => {
      const { referencedSchemaName, relationType } = getReferencedSchemaNameForField(
        referencingSchema,
        viaField
      );

      schemaReferences[referencingSchemaName].push({
        toSchema: referencedSchemaName,
        viaField,
        relationType
      });
    });
  });

  return schemaReferences;
}

function getReferencedSchemaNameForField(normalizrSchema, field: string) {
  const fieldDefinitions = getNormalizrFieldDefinitions(normalizrSchema);
  const normalizrFieldValue = fieldDefinitions[field];
  const is1ToManyRelation = Array.isArray(normalizrFieldValue);

  return {
    relationType: is1ToManyRelation ? "many" : "one",
    referencedSchemaName: is1ToManyRelation
      ? fieldDefinitions[field][0].key
      : fieldDefinitions[field].key
  };
}

function getNormalizrFieldDefinitions(normalizrSchema: schema.Entity) {
  return (normalizrSchema: any).schema;
}
