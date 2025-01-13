const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/cocktail-manager/frontend/src/App.js'],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        white: colors.white,
      },
    },
  },
  plugins: [],
};
