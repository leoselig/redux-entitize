// @flow

import {
  type EntityType,
  type StateType,
  type SchemaEntitiesMapType
} from "./reducer";

export function selectEntity(
  state: { entities: StateType },
  schema: string,
  id: string
): ?EntityType {
  const schemaEntities = selectSchemaEntitiesMap(state, schema);

  return schemaEntities[id] || null;
}

export function selectEntities(
  state: { entities: StateType },
  schema: string,
  ids?: string[]
): EntityType[] {
  const schemaEntities = selectSchemaEntitiesMap(state, schema);
  const relevantIDs = ids || Object.keys(schemaEntities);

  return relevantIDs.map(entityId => schemaEntities[entityId]);
}

function selectSchemaEntitiesMap(
  state: { entities: StateType },
  schema: string
): SchemaEntitiesMapType {
  const schemaEntities = state.entities[schema];

  if (!schemaEntities) {
    throw new Error(
      `Schema '${schema}' is unkown. Schemas in state are: [${Object.keys(
        state.entities
      ).join(", ")}]`
    );
  }

  return schemaEntities;
}
