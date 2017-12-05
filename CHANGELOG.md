# Changelog

## Version `next`

## Version `0.5.1`

### Changed
- **Reducer:** Schema map inside state is now nested inside a `schemaEntities`-field (this is **not** considered a breaking change, since selectors still work)
- **Reducer:** Now, when receiving a deletetion action, not only is the entity deleted but also all references to that entity from other entities are removed (e.g. when a comment is deleted, the `comments` in the article does not contain the comment afterwards anymore)
- **Reducer:** Updating entities is now way faster (1000 entities in ~3 seconds instead of 30) due to no longer deep-cloning the entire state.

## Version `0.4.0`

### Changed
- **Selectors:** All selectors are now based on [reselect](https://github.com/reactjs/reselect) to heavily improve rendering performance

## Version `0.3.1`

### Added
- **All:** Support hard deletion of entities through new `deleteEntityAction(schema: string, id: string)`

## Version `0.3.0`

### Changed
- **Selectors:** Selectors are now longer exported but need to be created via `createSelector(schemaMap)` which will apply denormalization by default

## Version `0.2.1`

### Fixed
- **Actions:** Missing export of `updateEntitiesAction`

## Version `0.2.0`

### Added
- **Actions:** Re-adds a "real" `updateEntitiesAction()` to update an array of entities of the same schema

## Version `0.1.0`

### Added
- **All:** Add [strangelog](https://github.com/neXenio/strangelog) to maintain a changelog
- **Selectors:** Now exposing two selectors `selectEntity(schema: string, id: string)` and `selectEntities(schema: string, ids?: string[])`