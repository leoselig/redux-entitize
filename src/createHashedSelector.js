// @flow

import { createSelectorCreator } from "reselect";

function hashFn(...args) {
  return args.reduce((acc, val) => `${acc}-${JSON.stringify(val)}`, "");
}

export default createSelectorCreator(func => {
  let lastState = null;

  let lastIdSelectionHash = null;

  let lastResult = null;

  return (state, idSelection) => {
    const newIdSelectionHash = hashFn(idSelection);

    if (state !== lastState || newIdSelectionHash !== lastIdSelectionHash) {
      lastState = state;
      lastIdSelectionHash = newIdSelectionHash;
      lastResult = func.call(null, lastState, idSelection);
    }

    return lastResult;
  };
}, hashFn);
