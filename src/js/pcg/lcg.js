/**
 * Linear congruential pseudo random number generator
 */
define('lcg', [], () => {
    /**
     * Generates random numbers based on the given seed
     * @param {number} seed
     */
    class LCG {
        constructor(seed) {
            this.state = seed & 0xffffffff;
        }

        /**
         * Returns a number in the range 0 to 2^32 - 1
         */
        next() {
            return this.state = ((this.state * 1664525 + 1013904223) & 0xffffffff);
        }

        /**
         * Returns a number in the range 0 to 1
         */
        random() {
            return this.next() / 0xffffffff + 0.5;
        }
    }

    return LCG;
});
