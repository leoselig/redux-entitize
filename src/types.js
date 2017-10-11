// @flow

import { type Schema } from "normalizr";

export type SchemaMapType<SchemasType: string> = {
  [schemaName: SchemasType]: Schema
};

export type EntityType = Object;

export type SchemaEntitiesMapType = {
  [id: string]: EntityType
};

type RelationTypeType = "one" | "many";

export type SchemaReferencesType = {
  [referencingSchema: string]: {
    toSchema: string,
    viaField: string,
    relationType: RelationTypeType
  }[]
};

type ByIDMapType<D> = {
  [id: string]: D
};

type BySchemaByIDMapType<D> = {
  [schema: string]: ByIDMapType<D>
};

export type StateType = {
  schemaReferences: SchemaReferencesType,
  schemaEntities: BySchemaByIDMapType<Object>
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
