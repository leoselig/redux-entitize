// @flow

import { denormalize } from "normalizr";

import createHashedSelector from "./createHashedSelector";
import type {
  EntityType,
  SchemaMapType,
  StateWithEntitiesType,
  PropsWithIdType,
  PropsWithIdsType,
  SelectorsType
} from "./types";

function selectEntitiesState({ entities }: StateWithEntitiesType) {
  return entities;
}

function selectIdFromProps(
  state: StateWithEntitiesType,
  { id }: PropsWithIdType
) {
  return id;
}

function selectIdsFromProps(
  state: StateWithEntitiesType,
  { ids }: PropsWithIdsType
) {
  return ids;
}

export default function createSelectors<SchemasType: string>(
  schemaMap: SchemaMapType<SchemasType>
): SelectorsType<SchemasType> {
  function ensureExistentSchema(schema: string) {
    if (!schemaMap.hasOwnProperty(schema)) {
      throw new Error(
        `Received unknown schema '${schema}'. Known schemas are [${Object.keys(
          schemaMap
        ).join(", ")}]`
      );
    }
  }

  const schemaSelectors = Object.keys(
    schemaMap
  ).reduce((previousSelectors, schemaName) => {
    const selectEntities = createHashedSelector(
      [selectEntitiesState],
      entities => entities[schemaName]
    );
    const selectAllIds = createHashedSelector([selectEntities], entities =>
      Object.keys(entities)
    );

    return {
      ...previousSelectors,
      [schemaName]: {
        selectEntities,
        selectIdFromProps,
        selectIdsFromProps,
        selectAllIds
      }
    };
  }, {});

  function createSelectSingle(schema: SchemasType): ?EntityType {
    return createHashedSelector(
      [selectEntitiesState, schemaSelectors[schema].selectIdFromProps],
      (entitiesState, id) =>
        denormalize(
          { [schema]: [id] },
          { [schema]: [schemaMap[schema]] },
          entitiesState
        )[schema][0] || null
    );
  }

  function createSelectSome(schema: SchemasType) {
    return createHashedSelector(
      [selectEntitiesState, schemaSelectors[schema].selectIdsFromProps],
      (entitiesState, ids) =>
        denormalize(
          { [schema]: ids },
          { [schema]: [schemaMap[schema]] },
          entitiesState
        )[schema]
    );
  }

  function createSelectAll(schema: SchemasType) {
    return createHashedSelector(
      [selectEntitiesState, schemaSelectors[schema].selectAllIds],
      (entitiesState, allIds) =>
        denormalize(
          { [schema]: allIds },
          { [schema]: [schemaMap[schema]] },
          entitiesState
        )[schema]
    );
  }

  function createSchemaSelectorSet(schema: SchemasType) {
    return {
      selectSingle: createSelectSingle(schema),
      selectSome: createSelectSome(schema),
      selectAll: createSelectAll(schema)
    };
  }

  // $FlowFixMe: Object.keys() is wrongly inferred here
  const entitySelectorsPerSchema = Object.keys(schemaMap).reduce(
    (schemaSelectorSets, schemaName: SchemasType) => ({
      ...schemaSelectorSets,
      [schemaName]: createSchemaSelectorSet(schemaName)
    }),
    {}
  );

  return {
    selectEntity(state, schema, id) {
      ensureExistentSchema(schema);

      return entitySelectorsPerSchema[schema].selectSingle(state, { id });
    },
    selectEntities(state, schema, ids) {
      ensureExistentSchema(schema);

      if (ids) {
        return entitySelectorsPerSchema[schema].selectSome(state, { ids });
      }

      return entitySelectorsPerSchema[schema].selectAll(state);
    }
  };
}
