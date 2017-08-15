// @flow

import { schema } from "normalizr";

import createSelectors from "../../src/createSelectors";

describe("selectors", () => {
  describe("when initialized with an array entity schema", () => {
    function setup() {
      const schemaMap = {
        articles: new schema.Entity("articles", {
          comments: [new schema.Entity("comments")]
        })
      };
      const state = {
        entities: {
          articles: {
            article_1: {
              id: "article_1",
              title: "Foo Bar 1",
              comments: ["comment_1", "comment_2"]
            },
            article_2: {
              id: "article_2",
              title: "Foo Bar 2",
              comments: []
            },
            article_3: {
              id: "article_3",
              title: "Foo Bar 3",
              comments: []
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
      };

      return {
        state,
        selectors: createSelectors(schemaMap)
      };
    }
    describe("selectEntity", () => {
      describe("when called with existent id", () => {
        test("returns the entity data with nested entities", () => {
          const { selectors, state } = setup();

          expect(
            selectors.selectEntity(state, "articles", "article_1")
          ).toMatchSnapshot();
        });
      });
      describe("when called with indentical arguments multiple times", () => {
        test("returns identical entity", () => {
          const { selectors, state } = setup();

          const output1 = selectors.selectEntity(
            state,
            "articles",
            "article_1"
          );

          const output2 = selectors.selectEntity(
            state,
            "articles",
            "article_1"
          );

          expect(output1).toBe(output2);
        });
      });

      describe("when called with non-existent id", () => {
        test("returns null", () => {
          const { selectors, state } = setup();

          expect(
            selectors.selectEntity(state, "articles", "article_non_existent")
          ).toEqual(null);
        });
      });
    });
    describe("selectEntities", () => {
      describe("when called without specific IDs", () => {
        test("returns array of all entities' data with nested entities", () => {
          const { selectors, state } = setup();

          expect(selectors.selectEntities(state, "articles")).toMatchSnapshot();
        });

        describe("when called with indentical arguments multiple times", () => {
          test("returns identical entities array", () => {
            const { selectors, state } = setup();

            const output1 = selectors.selectEntities(state, "articles");
            const output2 = selectors.selectEntities(state, "articles");

            expect(output1).toBe(output2);
          });
        });
      });
      describe("when called with specific IDs", () => {
        test("returns array of selected and nested entities' data", () => {
          const { selectors, state } = setup();

          expect(
            selectors.selectEntities(state, "articles", [
              "article_2",
              "article_3"
            ])
          ).toMatchSnapshot();
        });

        describe("when called with indentical arguments multiple times", () => {
          test("returns identical entities array", () => {
            const { selectors, state } = setup();

            const output1 = selectors.selectEntities(state, "articles", [
              "article_2",
              "article_3"
            ]);
            const output2 = selectors.selectEntities(state, "articles", [
              "article_2",
              "article_3"
            ]);

            expect(output1).toBe(output2);
          });
        });
      });
    });
  });
});
