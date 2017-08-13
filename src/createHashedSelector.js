// @flow

import { createSelectorCreator } from "reselect";
import memoize from "lodash/memoize";

function hashFn(...args) {
  return args.reduce((acc, val) => `${acc}-${JSON.stringify(val)}`, "");
}

export default createSelectorCreator(memoize, hashFn);
