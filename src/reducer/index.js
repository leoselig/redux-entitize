// @flow

import omit from "lodash/omit";
import without from "lodash/without";
import deepExtend from "deep-extend";
import { normalize } from "normalizr";

import type { SchemaMapType, StateType } from "../types";
import {
  type UpdateEntityActionType,
  type UpdateEntitiesActionType,
  type DeleteEntityActionType
} from "../actions";
import { UPDATE_ENTITY, UPDATE_ENTITIES, DELETE_ENTITY } from "../actionTypes";
import { getReferencesTo } from "../referenceTracker";

import { getReferencesForSchema } from "./schemaReferences";
import {
  updateReferencesForUpdatedEntities,
  updateReferencesForDeletedEntity,
  getReferenceID
} from "./entityReferences";

function getInitialState(schemas: SchemaMapType<*>): StateType {
  function intializeFromSchemas(schemas: SchemaMapType<*>) {
    return Object.keys(schemas)
      .map(nextSchemaName => schemas[nextSchemaName])
      .reduce(
        (state, nextSchema) => ({
          ...state,
          entityReferences: {},
          schemaEntities: {
            ...state.schemaEntities,
            [nextSchema.key]: {}
          }
        }),
        {
          schemaReferences: getReferencesForSchema(schemas),
          entityReferences: {},
          schemaEntities: {}
        }
      );
  }

  return intializeFromSchemas(schemas);
}

export default function createEntitiesReducer(schemas: SchemaMapType<*>) {
  function entitiesReducer(
    state: StateType = getInitialState(schemas),
    action: UpdateEntityActionType | Object
  ): StateType {
    switch (action.type) {
      case UPDATE_ENTITY:
        return handleUpdateEntity(state, action, schemas);
      case UPDATE_ENTITIES:
        return handleUpdateEntities(state, action, schemas);
      case DELETE_ENTITY:
        return handleDeleteEntity(state, action);
      default:
        return state;
    }
  }

  return entitiesReducer;
}

function updateEntity(
  state: StateType,
  data: Object,
  schema: string,
  schemas: SchemaMapType<*>
): StateType {
  if (!data.id) {
    throw new Error(`No 'id'-field found in entitiy of schema '${schema}'`);
  }

  const { entities } = normalize(data, schemas[schema]);

  return {
    ...state,
    schemaEntities: deepExtend({}, state.schemaEntities, entities),
    entityReferences: updateReferencesForUpdatedEntities(state, entities)
  };
}

function handleDeleteEntity(
  state: StateType,
  action: DeleteEntityActionType
): StateType {
  const { schema, id } = action.payload;

  return {
    ...state,
    entityReferences: updateReferencesForDeletedEntity(state, schema, id),
    schemaEntities: {
      ...state.schemaEntities,
      ...updateEntitiesForDeletedEntity(state, schema, id),
      [schema]: omit(state.schemaEntities[schema], id)
    }
  };
}

function handleUpdateEntity(
  state: StateType,
  action: UpdateEntityActionType,
  schemas: SchemaMapType<*>
): StateType {
  const { data, schema } = action.payload;

  return updateEntity(state, data, schema, schemas);
}

function handleUpdateEntities(
  state: StateType,
  action: UpdateEntitiesActionType,
  schemas: SchemaMapType<*>
): StateType {
  const { data, schema } = action.payload;

  return data.reduce(
    (currentState, entityData) =>
      updateEntity(currentState, entityData, schema, schemas),
    state
  );
}

function updateEntitiesForDeletedEntity(
  state: StateType,
  deletedSchemaName: string,
  deletedEntityId: string
) {
  const referencesToDeletedEntity = getReferencesTo(
    state.entityReferences,
    getReferenceID(deletedSchemaName, deletedEntityId)
  );

  return Object.keys(
    referencesToDeletedEntity
  ).reduce((toBeUpdatedEntities, referenceID) => {
    // $FlowFixMe We are the only one calling addReference() so we know we get the correct reference meta data back here
    const entityReference: EntityReferenceType =
      referencesToDeletedEntity[referenceID];
    const { fromSchema, fromID, viaField, relationType } = entityReference;

    const referencingEntity = state.schemaEntities[fromSchema][fromID];
    const newReferencesValue = relationType === "one"
      ? null
      : without(referencingEntity[viaField], deletedEntityId);

    return {
      ...toBeUpdatedEntities,
      [fromSchema]: {
        ...toBeUpdatedEntities[fromSchema],
        [fromID]: {
          ...referencingEntity,
          [viaField]: newReferencesValue
        }
      }
    };
  }, {});
}
