/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        boy: {
          blue: {
            light: '#BAE6FD',
            DEFAULT: '#38BDF8',
            dark: '#0284C7',
          },
          mint: {
            light: '#A7F3D0',
            DEFAULT: '#34D399',
            dark: '#059669',
          },
          butter: {
            light: '#FEF08A',
            DEFAULT: '#FACC15',
            dark: '#CA8A04',
          },
          orange: {
            light: '#FED7AA',
            DEFAULT: '#FB923C',
            dark: '#EA580C',
          },
          lavender: {
            light: '#DDD6FE',
            DEFAULT: '#A78BFA',
            dark: '#7C3AED',
          },
          cream: '#FFFBEB',
          dark: '#0F172A',
        },
      },
      boxShadow: {
        cartoon: '4px 4px 0px #0F172A',
        'cartoon-lg': '6px 6px 0px #0F172A',
        'cartoon-sm': '2px 2px 0px #0F172A',
        'cartoon-hover': '1px 1px 0px #0F172A',
      },
      borderRadius: {
        cartoon: '24px',
        'cartoon-sm': '16px',
      },
    },
  },
  plugins: [],
};
