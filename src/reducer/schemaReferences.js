// @flow

import type { SchemaMapType, SchemaReferencesType } from "../types";

// The following set of functions is solely responsible to analyze the static references that
// exist between the different schema types (e.g. this analyzes the fact the `articles` might
// reference entites of the schema `users` via their field `author`)
//
// This is not a reducer – just the logic needed to analyze the normalizr schemas

export function getReferencesForSchema(schemas: SchemaMapType<*>): SchemaReferencesType {
  const schemaReferences = {};

  Object.keys(schemas).forEach(referencingSchemaName => {
    const referencingSchema = schemas[referencingSchemaName];

    schemaReferences[referencingSchemaName] = [];

    Object.keys(referencingSchema.schema).forEach(viaField => {
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
  const normalizrFieldValue = normalizrSchema.schema[field];
  const is1ToManyRelation = Array.isArray(normalizrFieldValue);

  return {
    relationType: is1ToManyRelation ? "many" : "one",
    referencedSchemaName: is1ToManyRelation
      ? normalizrSchema.schema[field][0].key
      : normalizrSchema.schema[field].key
  };
}
