// For tests only, to be removed
import * as exports from './dist/index.js'
import * as Relations from './dist/algorithms/relation.js'
import * as Utils from './dist/utils/utils.js'

export * from './dist/index.js'
export { PlanarSet } from './dist/data_structures/PlanarSet.js'
export * as Distance from './dist/algorithms/distance.js'

const defaultExport = {
  ...exports,
  Relations,
  Utils,
}
export default defaultExport
