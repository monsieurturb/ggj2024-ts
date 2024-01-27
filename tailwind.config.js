const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    'index.html',
  ],
  theme: {
    fontFamily: {
      'sans': ['dovetail-mvb', ...defaultTheme.fontFamily.serif],
      'display': ['paroli', ...defaultTheme.fontFamily.sans],
    },
    extend: {},
  },
  plugins: [],
  safelist: [
    'font-sans',
    'font-display',
  ],
}

