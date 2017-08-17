/**
 * Generates 2D simplex noise
 */
define('simplex', ['lcg'], (LCG) => {
    // Skew factors for the simplex grid
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    // Gradient vector table
    const grad = [
        [ 1, 1], [-1, 1], [ 1,-1],
        [-1,-1], [ 1, 0], [-1, 0],
        [ 0, 1], [ 0,-1], [ 0, 1]
    ];

    /**
     * Simplex noise generator based on http://weber.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java
     * by Stefan Gustavson and Peter Eastman
     * @constructor
     * @param {number} seed
     */
    class Simplex {
        constructor(seed) {
            /**
             * @property {Uint8Array} perm - The permutation table
             */
            const perm = this.perm = new Uint8Array(512);

            /**
             * @property {Uint8Array} perm9 - The permutation table mod 9. This is used to look up the
             *      proper gradient vector.
             */
            const perm9 = this.perm9 = new Uint8Array(512);

            // Build the permutation table
            const rng = new LCG(seed);
            for (let i = 0, n; i < 256; i++) {
                n = Math.floor(256 * rng.random()) & 255;

                perm[i]  = perm[i + 256]  = n;
                perm9[i] = perm9[i + 256] = n % 9;
            }
        }

        /**
         * Returns a coherent noise value for the given coordinates.
         * @param {number} x 
         * @param {number} y
         * @returns {number}
         */
        getValue(x, y) {
            const perm = this.perm;
            const perm9 = this.perm9;
            
            const s = (x + y) * F2;
            const i = Math.floor(x + s);
            const j = Math.floor(y + s);
            const t = (i + j) * G2;
    
            const x0 = x - (i - t);
            const y0 = y - (j - t);
    
            let i1, j1;
    
            if (x0 > y0) {
                i1 = 1;
                j1 = 0;
            } else {
                i1 = 0;
                j1 = 1;
            }
    
            const x1 = x0 - i1 + G2;
            const y1 = y0 - j1 + G2;
            const x2 = x0 - 1 + 2 * G2;
            const y2 = y0 - 1 + 2 * G2;
    
            const ii = i & 255;
            const jj = j & 255;
    
            const gi0 = perm9[ii + perm[jj]];
            const gi1 = perm9[ii + i1 + perm[jj + j1]];
            const gi2 = perm9[ii + 1 + perm[jj + 1]];
    
            let t0 = 0.5 - x0 * x0 - y0 * y0;
            let t1 = 0.5 - x1 * x1 - y1 * y1;
            let t2 = 0.5 - x2 * x2 - y2 * y2;
            
            let n0, n1, n2;
    
            if (t0 < 0) n0 = 0;
            else {
                t0 *= t0;
                n0 = t0 * t0 * (grad[gi0][0] * x0 + grad[gi0][1] * y0);
            }
    
            if (t1 < 0) n1 = 0;
            else {
                t1 *= t1;
                n1 = t1 * t1 * (grad[gi1][0] * x1 + grad[gi1][1] * y1);
            }
    
            if (t2 < 0) n2 = 0;
            else {
                t2 *= t2;
                n2 = t2 * t2 * (grad[gi2][0] * x2 + grad[gi2][1] * y2);
            }
    
            return 70 * (n0 + n1 + n2);
        }

        /**
         * Create a value using fractional Brownian motion. For a single octave this is
         * equivalent to just calling `Simplex.getValue`.
         * @param {number} x 
         * @param {number} y 
         * @param {number} octaves 
         * @param {number} persistence 
         * @param {number} lacunarity
         * @returns {number}
         */
        fbm(x, y, octaves, persistence, lacunarity) {
            let val = 0;
            let max = 0;
            let a = 1;
            let f = 1;

            for (let i = 0; i < octaves; i++) {
                val += this.getValue(x * f, y * f) * a;

                max += a;
                a *= persistence;
                f *= lacunarity;
            }

            return val / max;
        }

        /**
         * Generates an `ImageData`
         * @param {number} width - Texture width
         * @param {number} height - Texture height
         * @param {number} x0 - x offset
         * @param {number} y0 - y offset
         * @param {number} scale - Coordinate scale
         * @param {number} octaves - fbm octaves
         * @param {number} persistence - fbm persistence
         * @param {number} lacunarity - fbm lacunarity
         * @returns {ImageData}
         */
        texture(width, height, x0, y0, scale, octaves, persistence, lacunarity) {
            const imgData = new ImageData(800, 600);
            const data = imgData.data;

            let i = 0;
            for (let y = 0; y < 600; y++) {
                for (let x = 0; x < 800; x++) {
                    const val = Math.floor(
                        this.fbm(
                            (x + x0) * scale,
                            (y + y0) * scale,
                            octaves,
                            persistence,
                            lacunarity
                        ) * 128 + 128
                    );

                    data[i    ] = val;
                    data[i + 1] = val;
                    data[i + 2] = val;
                    data[i + 3] = 255;

                    i += 4;
                }
            }

            return imgData;
        }
    }

    return Simplex;
});
