/**
 * Class of system errors
 */
export default class Errors {
    /**
     * Throw error ILLEGAL_PARAMETERS when cannot instantiate from given parameter
     * @returns {ReferenceError}
     */
    static get ILLEGAL_PARAMETERS(): ReferenceError;
    /**
     * Throw error ZERO_DIVISION to catch situation of zero division
     * @returns {Error}
     */
    static get ZERO_DIVISION(): Error;
    /**
     * Error to throw from BooleanOperations module in case when fixBoundaryConflicts not capable to fix it
     * @returns {Error}
     */
    static get UNRESOLVED_BOUNDARY_CONFLICT(): Error;
    /**
     * Error to throw from LinkedList:testInfiniteLoop static method
     * in case when circular loop detected in linked list
     * @returns {Error}
     */
    static get INFINITE_LOOP(): Error;
    static get CANNOT_INVOKE_ABSTRACT_METHOD(): Error;
    static get OPERATION_IS_NOT_SUPPORTED(): Error;
}
//# sourceMappingURL=errors.d.ts.map