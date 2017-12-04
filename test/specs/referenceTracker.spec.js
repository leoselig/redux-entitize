// @flow

import {
  getReferencesTo,
  addReference,
  deleteReference,
  deleteAllReferencesTo
} from "../../src/referenceTracker";

describe("referenceTracker", () => {
  describe("when getReferencesTo() is called for an unknown entity", () => {
    it("returns empty array", () => {
      expect(getReferencesTo({}, "unkownEntityId")).toEqual({});
    });
  });
  describe("when reference is added", () => {
    describe("and getReferencesTo() is called on target entity", () => {
      it("returns array with one entry for source entity", () => {
        const references = addReference({}, "sourceId1", "targetEntity");

        expect(getReferencesTo(references, "targetEntity")).toEqual({
          sourceId1: null
        });
      });
    });
  });
  describe("when reference is added with meta data", () => {
    describe("and getReferencesTo() is called on target entity", () => {
      it("returns array with one entry for source entity with meta data attached", () => {
        const references = addReference({}, "sourceId1", "targetEntity", {
          foo: "bar"
        });

        expect(getReferencesTo(references, "targetEntity")).toEqual({
          sourceId1: { foo: "bar" }
        });
      });
    });
  });
  describe("when two reference are added", () => {
    describe("and getReferencesTo() is called on target entity", () => {
      it("returns array with two entries for source entities", () => {
        const references1 = addReference({}, "sourceId1", "targetEntity");
        const references2 = addReference(
          references1,
          "sourceId2",
          "targetEntity"
        );

        expect(getReferencesTo(references2, "targetEntity")).toEqual({
          sourceId1: null,
          sourceId2: null
        });
      });
    });
    describe("and one is deleted again", () => {
      function add2Delete1(references) {
        const references1 = addReference(
          references,
          "toBeDeletedEntity",
          "targetEntity"
        );
        const references2 = addReference(
          references1,
          "remainingEntity",
          "targetEntity"
        );

        return deleteReference(
          references2,
          "toBeDeletedEntity",
          "targetEntity"
        );
      }

      describe("and getReferencesTo() is called on target entity", () => {
        it("returns array with one entry for the remaining source entity", () => {
          const references = add2Delete1({});

          expect(getReferencesTo(references, "targetEntity")).toEqual({
            remainingEntity: null
          });
        });
      });

      it("getReferencesTo() for different entity does not change identity", () => {
        const references1 = addReference(
          {},
          "differentSourceEntity",
          "differentTargetEntity"
        );
        const unrelatedReferencesBefore = getReferencesTo(
          references1,
          "differentTargetEntity"
        );

        const references2 = add2Delete1(references1);

        const unrelatedReferencesAfter = getReferencesTo(
          references2,
          "differentTargetEntity"
        );

        expect(unrelatedReferencesBefore === unrelatedReferencesAfter).toBe(
          true
        );
      });
    });
  });
  describe("when 2 references are added", () => {
    describe("and deleteAllReferencesTo() is called for target entity", () => {
      describe("and getReferencesTo() is called for target entity", () => {
        it("returns empty references", () => {
          const references1 = addReference({}, "sourceId1", "targetEntity");
          const references2 = addReference(
            references1,
            "sourceId2",
            "targetEntity"
          );
          const references3 = deleteAllReferencesTo(references2, "targetEntity");

          expect(getReferencesTo(references3, "targetEntity")).toEqual({});
        });
      });
    });
  });
});
