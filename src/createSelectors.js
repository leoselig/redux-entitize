// @flow

import { denormalize } from "normalizr";

import { type StateType, type SchemaEntitiesMapType } from "./reducer";
import type { EntityType, SchemaMapType } from "./types";

export default function createSelectors(schemaMap: SchemaMapType) {
  function selectEntity(
    state: { entities: StateType },
    schema: string,
    id: string
  ): ?EntityType {
    ensureExistingSchema(state, schema);

    return (
      denormalize(
        { [schema]: [id] },
        { [schema]: [schemaMap[schema]] },
        state.entities
      )[schema][0] || null
    );
  }

  function selectEntities(
    state: { entities: StateType },
    schema: string,
    ids?: string[]
  ): EntityType[] {
    const schemaEntities = selectSchemaEntitiesMap(state, schema);
    const relevantIDs = ids || Object.keys(schemaEntities);

    return denormalize(
      { [schema]: relevantIDs },
      { [schema]: [schemaMap[schema]] },
      state.entities
    )[schema];
  }

  function selectSchemaEntitiesMap(
    state: { entities: StateType },
    schema: string
  ): SchemaEntitiesMapType {
    const schemaEntities = state.entities[schema];

    ensureExistingSchema(state, schema);

    return schemaEntities;
  }

  function ensureExistingSchema(
    state: { entities: StateType },
    schema: string
  ) {
    if (!state.entities[schema]) {
      throw new Error(
        `Schema '${schema}' is unkown. Schemas in state are: [${Object.keys(
          state.entities
        ).join(", ")}]`
      );
    }
  }

  return {
    selectEntity,
    selectEntities
  };
}
