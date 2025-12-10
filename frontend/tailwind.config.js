// export default {
//   content: ["./index.html", "./src/**/*.{js,jsx}"],
//   theme: { extend: {} },
//   plugins: []
// };


export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // ME-DMZ palette
        "me-ink": "#232073",        // primary dark blue
        "me-sky": "#CEECF2",        // light blue tint
        "me-sky-strong": "#6BB8D5", // medium blue active
        "me-orange": "#D97218",
        "me-yellow": "#F2C53D",
        "me-green": "#3AA608",

        // neutrals
        "me-bg": "#F5F5F5",
        "me-text": "#747474",
        "me-border": "#D9D9D9",
        "me-rowhover": "#EDF3F4",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        me: "0 1px 3px rgba(0,0,0,0.10)",
      }
    },
  },
  plugins: [],
};
