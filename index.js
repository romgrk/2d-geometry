// For tests only, to be removed
import * as exports from './dist/index.js'
import * as Distance from './dist/algorithms/distance.js'
import * as Relations from './dist/algorithms/relation.js'
import * as BooleanOperations from './dist/algorithms/booleanOperations.js'
import * as Utils from './dist/utils/utils.js'
import * as Constants from './dist/utils/constants.js'
import Errors from './dist/utils/errors.js'

export * from './dist/index.js'
export { PlanarSet } from './dist/data_structures/PlanarSet.js'
export * as Distance from './dist/algorithms/distance.js'
export * from './dist/utils/constants.js'

export function _(o) {
  const result = {}
  Object.keys(o).forEach(k => {
    if (k.startsWith('_'))
      return
    result[k] = o[k]
  })
  return result
}

const defaultExport = {
  ...exports,
  ...Constants,
  Distance,
  Relations,
  BooleanOperations,
  Utils,
  Errors,
  _,
}
export default defaultExport
