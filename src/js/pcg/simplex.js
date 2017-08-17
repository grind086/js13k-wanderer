/**
 * Generates 2D simplex noise
 */
define('simplex', ['lcg'], (LCG) => {
    // Skew factors
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;

    const grad = [
        [ 1, 1], [-1, 1], [ 1,-1],
        [-1,-1], [ 1, 0], [-1, 0],
        [ 0, 1], [ 0,-1], [ 0, 1]
    ];

    /**
     * Simplex noise generator based on http://weber.itn.liu.se/~stegu/simplexnoise/SimplexNoise.java
     * by Stefan Gustavson
     * @constructor
     * @param rng - A PRNG that returns numbers in the range 0 to 1
     */
    class Simplex {
        constructor(seed) {
            const perm = this.perm = new Uint8Array(512);
            const perm9 = this.perm9 = new Uint8Array(512);

            const rng = new LCG(seed);

            // Build a permutation table
            for (let i = 0, n; i < 256; i++) {
                // TODO: Seedable? (LCG or Alea)
                n = Math.floor(256 * rng.random()) & 255;

                perm[i]  = perm[i + 256]  = n;
                perm9[i] = perm9[i + 256] = n % 9;
            }
        }

        /**
         * Returns a coherent noise value for the given coordinates.
         * @param {number} x 
         * @param {number} y 
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
    }

    return Simplex;
});
