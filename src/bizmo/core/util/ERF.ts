/**
 * https://github.com/nodef/extra-math/blob/master/src/erf.ts
 */

const A1 = 0.254829592;
const A2 = -0.284496736;
const A3 = 1.421413741;
const A4 = -1.453152027;
const A5 = 1.061405429;
const P = 0.3275911;

/**
 * Finds error function value of number (approximation).
 * @param {number} num a number
 * @return {number}
 */
function erf(num: number): number {
    const sgn = num < 0 ? -1 : 1;
    const n = Math.abs(num);
    const t = 1 / (1 + P * n);
    const y =
        1 -
        ((((A5 * t + A4) * t + A3) * t + A2) * t + A1) * t * Math.exp(-n * n);
    return sgn * y;
}
export default erf;
