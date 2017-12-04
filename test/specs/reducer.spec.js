// @flow

import { schema } from "normalizr";

import createEntitiesReducer from "../../src/reducer";
import {
  updateEntityAction,
  updateEntitiesAction,
  deleteEntityAction
} from "../../src/actions";
import { createSpyStore } from "../utils";

describe("reducer", () => {
  function createReducerWithSingleSchema() {
    return createEntitiesReducer({
      articles: new schema.Entity("articles")
    });
  }

  function createReducerWith1To1Schema() {
    const authorSchema = new schema.Entity("authors");

    return createEntitiesReducer({
      authors: authorSchema,
      articles: new schema.Entity("articles", {
        author: authorSchema
      })
    });
  }

  function createReducerWith1ToNSchema() {
    const commentSchema = new schema.Entity("comments");

    return createEntitiesReducer({
      comments: commentSchema,
      articles: new schema.Entity("articles", {
        comments: [commentSchema]
      })
    });
  }

  function getInitialState(reducer) {
    return reducer(void 0, { type: "UNPROCESSED_PROBE_ACTION" });
  }

  function setupSingleEntityStore() {
    return createSpyStore({
      entities: createReducerWithSingleSchema()
    });
  }

  function setupStoreWith1To1Schema() {
    return createSpyStore({
      entities: createReducerWith1To1Schema()
    });
  }

  function setupStoreWith1ToNSchema() {
    return createSpyStore({
      entities: createReducerWith1ToNSchema()
    });
  }

  describe("schemaReferences", () => {
    describe("without references", () => {
      it("puts no reference for schema into initial state", () => {
        expect(
          getInitialState(createReducerWithSingleSchema()).schemaReferences
        ).toEqual({
          articles: []
        });
      });
    });

    describe("with reference to 1:1 schema.Entity", () => {
      it("puts reference for schema into initial state", () => {
        expect(
          getInitialState(createReducerWith1To1Schema()).schemaReferences
        ).toEqual({
          articles: [
            {
              toSchema: "authors",
              viaField: "author",
              relationType: "one"
            }
          ],
          authors: []
        });
      });
    });

    describe("with reference to 1:n schema.Entity", () => {
      it("puts reference for schema into initial state", () => {
        expect(
          getInitialState(createReducerWith1ToNSchema()).schemaReferences
        ).toEqual({
          articles: [
            {
              toSchema: "comments",
              viaField: "comments",
              relationType: "many"
            }
          ],
          comments: []
        });
      });
    });
  });

  describe("when receiving DELETE_ENTITY action", () => {
    describe("when updating a known entity", () => {
      test("removes entity from state", () => {
        const store = setupSingleEntityStore();

        store.dispatch(
          updateEntityAction("articles", {
            id: "article_1",
            title: "Foo Bar"
          })
        );
        expect(
          Object.keys(store.getState().entities.schemaEntities.articles)
        ).toContain("article_1");

        store.dispatch(deleteEntityAction("articles", "article_1"));

        expect(
          Object.keys(store.getState().entities.schemaEntities.articles)
        ).not.toContain("article_1");
      });
    });

    describe("when initilized with a 1:1 entity schema", () => {
      test("sets reference in parent entity to null", () => {
        const store = setupStoreWith1To1Schema();

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

        store.dispatch(deleteEntityAction("authors", "author_1"));

        expect(store.getState().entities.schemaEntities).toEqual({
          articles: {
            article_1: {
              id: "article_1",
              title: "Foo Bar",
              author: null
            }
          },
          authors: {}
        });
      });
    });
    describe("when initilized with an 1:n entity schema", () => {
      function addArticleWith2CommentsAndDelete1() {
        const store = setupStoreWith1ToNSchema();

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

        store.dispatch(deleteEntityAction("comments", "comment_1"));

        return { store };
      }
      test("removes referenced id from field in parent entity", () => {
        const { store } = addArticleWith2CommentsAndDelete1();

        expect(store.getState().entities.schemaEntities).toEqual({
          articles: {
            article_1: {
              id: "article_1",
              title: "Foo Bar",
              comments: ["comment_2"]
            }
          },
          comments: {
            comment_2: {
              id: "comment_2",
              title: "Bad"
            }
          }
        });
      });
      test("removes referenced id from field in parent entity", () => {
        const { store } = addArticleWith2CommentsAndDelete1();

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

        store.dispatch(deleteEntityAction("comments", "comment_1"));

        expect(store.getState().entities.entityReferences).toEqual({
          "comments#comment_2": {
            "articles#article_1.comments": {
              fromID: "article_1",
              fromSchema: "articles",
              relationType: "many",
              viaField: "comments"
            }
          }
        });
      });
    });
  });

  describe("when receiving UPDATE_ENTITY action", () => {
    describe("when updating with a new entity", () => {
      test("puts entity into state", () => {
        const store = setupSingleEntityStore();

        store.dispatch(
          updateEntityAction("articles", {
            id: "article_1",
            title: "Foo Bar"
          })
        );

        expect(store.getState().entities.schemaEntities).toEqual({
          articles: {
            article_1: {
              id: "article_1",
              title: "Foo Bar"
            }
          }
        });
      });
    });
    describe("when updating a known entity", () => {
      test("merges old and new entity", () => {
        const store = setupSingleEntityStore();

        store.dispatch(
          updateEntityAction("articles", {
            id: "article_1",
            foo: "stays the same",
            bar: "will change"
          })
        );
        store.dispatch(
          updateEntityAction("articles", {
            id: "article_1",
            bar: "changed",
            baz: "is new"
          })
        );

        expect(store.getState().entities.schemaEntities).toEqual({
          articles: {
            article_1: {
              id: "article_1",
              foo: "stays the same",
              bar: "changed",
              baz: "is new"
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

    describe("when initilized with a nested entity schema", () => {
      describe("when adding an entity without references", () => {
        it("adds only that entity without any references", () => {
          const store = setupStoreWith1To1Schema();

          store.dispatch(
            updateEntityAction("authors", {
              id: "comment_1",
              name: "Mrs. Where is my article?"
            })
          );

          expect(store.getState().entities.schemaEntities).toEqual({
            articles: {},
            authors: {
              comment_1: {
                id: "comment_1",
                name: "Mrs. Where is my article?"
              }
            }
          });
          expect(store.getState().entities.entityReferences).toEqual({});
        });
      });

      describe("when updating with a new entity", () => {
        function update1To1Entity() {
          const store = setupStoreWith1To1Schema();

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

          return store;
        }

        test("puts entity and nested entity into each state", () => {
          expect(
            update1To1Entity().getState().entities.schemaEntities
          ).toEqual({
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
          });
        });
        test("puts entity reference into state", () => {
          expect(
            update1To1Entity().getState().entities.entityReferences
          ).toEqual({
            "authors#author_1": {
              "articles#article_1.author": {
                fromID: "article_1",
                fromSchema: "articles",
                relationType: "one",
                viaField: "author"
              }
            }
          });
        });
      });
      describe("when updating a known entity", () => {
        function update1To1ExistingEntity() {
          const store = setupStoreWith1To1Schema();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              foo: "stays the same",
              bar: "will change",
              author: {
                id: "author_1",
                foo: "stays the same",
                bar: "will change"
              }
            })
          );

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

          return store;
        }
        test("merges old and new entity", () => {
          expect(
            update1To1ExistingEntity().getState().entities.schemaEntities
          ).toEqual({
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
          });
        });
      });
    });
    describe("when initilized with an array entity schema", () => {
      function update1ToNEntity() {
        const store = setupStoreWith1ToNSchema();

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

        return store;
      }
      describe("when updating with a new entity", () => {
        test("puts entity and nested entity into each state", () => {
          expect(
            update1ToNEntity().getState().entities.schemaEntities
          ).toEqual({
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
          });
        });
      });
      describe("when updating a known entity", () => {
        function updateExisting1ToNEntity() {
          const store = setupStoreWith1ToNSchema();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              foo: "stays the same",
              bar: "will change",
              comments: [
                {
                  id: "comment_1",
                  foo: "stays the same",
                  bar: "will change"
                }
              ]
            })
          );

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

          return store;
        }
        test("merges old and new entity", () => {
          expect(
            updateExisting1ToNEntity().getState().entities.schemaEntities
          ).toEqual({
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
          });
        });
      });
      describe("that adds one, keeps one and removes one other referenced entity", () => {
        test("contains only kept and new reference", () => {
          const store = setupStoreWith1ToNSchema();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              comments: [{ id: "comment_1_kept" }, { id: "comment_2_removed" }]
            })
          );

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              comments: [{ id: "comment_1_kept" }, { id: "comment_3_added" }]
            })
          );
          expect(store.getState().entities.entityReferences).toEqual({
            "comments#comment_1_kept": {
              "articles#article_1.comments": {
                fromID: "article_1",
                fromSchema: "articles",
                relationType: "many",
                viaField: "comments"
              }
            },
            "comments#comment_2_removed": {},
            "comments#comment_3_added": {
              "articles#article_1.comments": {
                fromID: "article_1",
                fromSchema: "articles",
                relationType: "many",
                viaField: "comments"
              }
            }
          });
        });
      });
      describe("when adding an entity that references an already existing & references entity", () => {
        test("merges the references of the old and new entities", () => {
          const store = setupStoreWith1ToNSchema();

          store.dispatch(
            updateEntityAction("articles", {
              id: "article_1",
              comments: [{ id: "comment_1" }]
            })
          );
          store.dispatch(
            updateEntityAction("articles", {
              id: "article_2",
              comments: [{ id: "comment_1" }]
            })
          );

          expect(store.getState().entities.entityReferences).toEqual({
            "comments#comment_1": {
              "articles#article_1.comments": {
                fromID: "article_1",
                fromSchema: "articles",
                relationType: "many",
                viaField: "comments"
              },
              "articles#article_2.comments": {
                fromID: "article_2",
                fromSchema: "articles",
                relationType: "many",
                viaField: "comments"
              }
            }
          });
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

        expect(store.getState().entities.schemaEntities).toEqual({
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
        });
      });
    });
  });
});
