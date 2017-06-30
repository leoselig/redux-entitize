// @flow

import { selectEntity, selectEntities } from "../../src/selectors";

describe("selectors", () => {
  function getTestState() {
    return {
      entities: {
        articles: {
          article_1: {
            id: "article_1",
            title: "Foo Bar 1"
          },
          article_2: {
            id: "article_2",
            title: "Foo Bar 2"
          },
          article_3: {
            id: "article_3",
            title: "Foo Bar 3"
          }
        }
      }
    };
  }
  describe("selectEntity", () => {
    describe("when called with non-existent schema", () => {
      test("throws an error", () => {
        expect(() =>
          selectEntity(getTestState(), "unkownSchema", "irrelevant_id")
        ).toThrow(
          "Schema 'unkownSchema' is unkown. Schemas in state are: [articles]"
        );
      });
    });

    describe("when called with existent id", () => {
      test("returns the entity data", () => {
        expect(selectEntity(getTestState(), "articles", "article_1")).toEqual({
          id: "article_1",
          title: "Foo Bar 1"
        });
      });
    });

    describe("when called with non-existent id", () => {
      test("returns null", () => {
        expect(
          selectEntity(getTestState(), "articles", "article_non_existent")
        ).toEqual(null);
      });
    });
  });
  describe("selectEntities", () => {
    describe("when called with only the schema", () => {
      test("returns array of all entities' data", () => {
        expect(selectEntities(getTestState(), "articles")).toEqual([
          {
            id: "article_1",
            title: "Foo Bar 1"
          },
          {
            id: "article_2",
            title: "Foo Bar 2"
          },
          {
            id: "article_3",
            title: "Foo Bar 3"
          }
        ]);
      });
    });
    describe("when called with the schema and an array of IDs", () => {
      test("returns array of the selected entities' data", () => {
        expect(
          selectEntities(getTestState(), "articles", ["article_2", "article_3"])
        ).toEqual([
          {
            id: "article_2",
            title: "Foo Bar 2"
          },
          {
            id: "article_3",
            title: "Foo Bar 3"
          }
        ]);
      });
    });
  });
});
