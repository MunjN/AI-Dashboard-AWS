// src/theme/medmzTheme.js
export const FX_DMZ_COLORS = {
  darkBlue: "#232073",
  lightBlue: "#CEECF2",
  green: "#3AA608",
  orange: "#D97218",
  yellow: "#F2C53D",
  grey: "#747474",
  lightGrey: "#D9D9D9",
};

export const CHART_COLORS = [
  FX_DMZ_COLORS.green,
  FX_DMZ_COLORS.yellow,
  FX_DMZ_COLORS.orange,
  FX_DMZ_COLORS.darkBlue,
  FX_DMZ_COLORS.lightBlue,
  FX_DMZ_COLORS.grey,
];

// helper: return n colors cycling through palette
export function getCycledColors(n) {
  return Array.from({ length: n }, (_, i) => CHART_COLORS[i % CHART_COLORS.length]);
}
