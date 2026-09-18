/**
 * MPL S4 First Page Asset Loader
 * Imports logo.jpeg and rules.jpeg from firstpagelogos/
 */

const logoModules = import.meta.glob('../../firstpagelogos/logo.{jpeg,jpg,png}', {
  eager: true,
  import: 'default'
});

const rulesModules = import.meta.glob('../../firstpagelogos/rules.{jpeg,jpg,png}', {
  eager: true,
  import: 'default'
});

export const logoImage = Object.values(logoModules)[0] || '';
export const rulesImage = Object.values(rulesModules)[0] || '';
