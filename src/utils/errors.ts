const Errors = {
  /**
   * Throw error ILLEGAL_PARAMETERS when cannot instantiate from given parameter
   */
  get ILLEGAL_PARAMETERS() {
    return new ReferenceError('Illegal Parameters')
  },

  /**
   * Throw error ZERO_DIVISION to catch situation of zero division
   */
  get ZERO_DIVISION() {
    return new Error('Zero division')
  },

  /**
   * Error to throw from BooleanOperations module in case when fixBoundaryConflicts not capable to fix it
   */
  get UNRESOLVED_BOUNDARY_CONFLICT() {
    return new Error('Unresolved boundary conflict in boolean operation')
  },

  /**
   * Error to throw from LinkedList:testInfiniteLoop static method
   * in case when circular loop detected in linked list
   */
  get INFINITE_LOOP() {
    return new Error('Infinite loop')
  },

  get CANNOT_INVOKE_ABSTRACT_METHOD() {
    return new Error('Abstract method cannot be invoked')
  },

  get OPERATION_IS_NOT_SUPPORTED() {
    return new Error('Operation is not supported')
  },
}

export default Errors
