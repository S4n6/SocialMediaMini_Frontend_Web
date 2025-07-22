export const SCREEN_SIZES = {
  sm: "30em",
  md: "48em",
  lg: "62em",
  xl: "80em",
  "2xl": "96em",
};

export const SCREEN_BREAKPOINTS = {
  sm: `(min-width: ${SCREEN_SIZES.sm})`,
  md: `(min-width: ${SCREEN_SIZES.md})`,
  lg: `(min-width: ${SCREEN_SIZES.lg})`,
  xl: `(min-width: ${SCREEN_SIZES.xl})`,
  "2xl": `(min-width: ${SCREEN_SIZES["2xl"]})`,
};
