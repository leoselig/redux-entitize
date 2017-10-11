// @flow

import { type Schema } from "normalizr";

export type SchemaMapType<SchemasType: string> = {
  [schemaName: SchemasType]: Schema
};

export type EntityType = Object;

export type SchemaEntitiesMapType = {
  [id: string]: EntityType
};

export type StateType = {
  schemaEntities: {
    [schema: string]: SchemaEntitiesMapType
  }
};

export type StateWithEntitiesType = {
  entities: StateType
};

export type PropsWithIdType = {
  id: string
};

export type PropsWithIdsType = {
  ids: string[]
};

export type SelectorsType<SchemasType: string> = {
  selectEntity: (
    state: StateWithEntitiesType,
    schema: SchemasType,
    id: string
  ) => ?EntityType,
  selectEntities: (
    state: StateWithEntitiesType,
    schema: SchemasType,
    ids?: string[]
  ) => EntityType[]
};
