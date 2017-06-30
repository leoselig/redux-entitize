// @flow

import { schema } from "normalizr";

import createEntitiesReducer from "../../src/reducer";
import { updateEntityAction, updateEntitiesAction } from "../../src/actions";
import { createSpyStore } from "../utils";

describe("reducer", () => {
  describe("when initilized with a single-entity schema", () => {
    function setupSingleEntityStore(
      state = {
        articles: {}
      }
    ) {
      return createSpyStore(
        { entities: state },
        {
          entities: createEntitiesReducer({
            articles: new schema.Entity("articles")
          })
        }
      );
    }
    describe("when receiving UPDATE_ENTITY action", () => {
      describe("with new entity", () => {
        test("puts entity into state", () => {
          const store = setupSingleEntityStore();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              title: "Foo Bar"
            })
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  title: "Foo Bar"
                }
              }
            }
          });
        });
      });
      describe("with known entity", () => {
        test("merges old and new entity", () => {
          const store = setupSingleEntityStore({
            articles: {
              article_1: {
                foo: "stays the same",
                bar: "will change"
              }
            }
          });

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              bar: "changed",
              baz: "is new"
            })
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  foo: "stays the same",
                  bar: "changed",
                  baz: "is new"
                }
              }
            }
          });
        });
      });

      describe("without id", () => {
        test("throws an error", () => {
          const store = setupSingleEntityStore();

          expect(() => {
            store.dispatch(
              updateEntityAction("articles", {
                title: "ID missing"
              })
            );
          }).toThrow("No 'id'-field found in entitiy of schema 'articles'");
        });
      });
    });
    describe("when initilized with a nested entity schema", () => {
      function setupNestedEntityStore(
        state = {
          articles: {},
          authors: {}
        }
      ) {
        return createSpyStore(
          { entities: state },
          {
            entities: createEntitiesReducer({
              articles: new schema.Entity("articles", {
                author: new schema.Entity("authors")
              })
            })
          }
        );
      }
      describe("with new entity", () => {
        test("puts entity and nested entity into each state", () => {
          const store = setupNestedEntityStore();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              title: "Foo Bar",
              author: {
                id: "author_1",
                name: "Mr. X"
              }
            })
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  title: "Foo Bar",
                  author: "author_1"
                }
              },
              authors: {
                author_1: {
                  id: "author_1",
                  name: "Mr. X"
                }
              }
            }
          });
        });
      });
      describe("with known entity", () => {
        test("merges old and new entity", () => {
          const store = setupNestedEntityStore({
            articles: {
              article_1: {
                foo: "stays the same",
                bar: "will change",
                author: "author_1"
              }
            },
            authors: {
              author_1: {
                id: "author_1",
                foo: "stays the same",
                bar: "will change"
              }
            }
          });

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              bar: "changed",
              baz: "is new",
              author: {
                id: "author_1",
                bar: "changed",
                baz: "is new"
              }
            })
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  foo: "stays the same",
                  bar: "changed",
                  baz: "is new",
                  author: "author_1"
                }
              },
              authors: {
                author_1: {
                  id: "author_1",
                  foo: "stays the same",
                  bar: "changed",
                  baz: "is new"
                }
              }
            }
          });
        });
      });
    });
    describe("when initilized with an array entity schema", () => {
      function setupArrayEntityStore(
        state = {
          articles: {},
          comments: {}
        }
      ) {
        return createSpyStore(
          { entities: state },
          {
            entities: createEntitiesReducer({
              articles: new schema.Entity("articles", {
                comments: [new schema.Entity("comments")]
              })
            })
          }
        );
      }
      describe("with new entity", () => {
        test("puts entity and nested entity into each state", () => {
          const store = setupArrayEntityStore();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              title: "Foo Bar",
              comments: [
                {
                  id: "comment_1",
                  title: "Good"
                },
                {
                  id: "comment_2",
                  title: "Bad"
                }
              ]
            })
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  title: "Foo Bar",
                  comments: ["comment_1", "comment_2"]
                }
              },
              comments: {
                comment_1: {
                  id: "comment_1",
                  title: "Good"
                },
                comment_2: {
                  id: "comment_2",
                  title: "Bad"
                }
              }
            }
          });
        });
      });
      describe("with known entity", () => {
        test("merges old and new entity", () => {
          const store = setupArrayEntityStore({
            articles: {
              article_1: {
                foo: "stays the same",
                bar: "will change",
                comments: ["comment_1"]
              }
            },
            comments: {
              comment_1: {
                id: "comment_1",
                foo: "stays the same",
                bar: "will change"
              }
            }
          });

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              bar: "changed",
              baz: "is new",
              comments: [
                {
                  id: "comment_1",
                  bar: "changed",
                  baz: "is new"
                }
              ]
            })
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  foo: "stays the same",
                  bar: "changed",
                  baz: "is new",
                  comments: ["comment_1"]
                }
              },
              comments: {
                comment_1: {
                  id: "comment_1",
                  foo: "stays the same",
                  bar: "changed",
                  baz: "is new"
                }
              }
            }
          });
        });
      });
    });
    describe("when receiving UPDATE_ENTITIES action", () => {
      describe("with new entities", () => {
        test("puts entities into state", () => {
          const store = setupSingleEntityStore();

          store.dispatch(
            updateEntitiesAction("articles", [
              {
                id: "article_1",
                title: "Foo Bar 1"
              },
              {
                id: "article_2",
                title: "Foo Bar 2"
              }
            ])
          );

          expect(store.getState()).toEqual({
            entities: {
              articles: {
                article_1: {
                  id: "article_1",
                  title: "Foo Bar 1"
                },
                article_2: {
                  id: "article_2",
                  title: "Foo Bar 2"
                }
              }
            }
          });
        });
      });
    });
  });
});
