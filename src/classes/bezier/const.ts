/**
 * @private
 */
export const curves = {
    adaptive: true,
    maxLength: 10,
    minSegments: 8,
    maxSegments:  2048,

    epsilon: 0.0001,

    _segmentsCount(length: number, defaultSegments = 20)
    {
        if (!this.adaptive || !length || isNaN(length))
        {
            return defaultSegments;
        }

        let result = Math.ceil(length / this.maxLength);

        if (result < this.minSegments)
        {
            result = this.minSegments;
        }
        else if (result > this.maxSegments)
        {
            result = this.maxSegments;
        }

        return result;
    },
};
