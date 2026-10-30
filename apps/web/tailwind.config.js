/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          deepNavy: '#073253',
          primaryNavy: '#0B3556',
          orange: '#FF850D',
          orangeHover: '#E67300',
          redAccent: '#D92D36',
          white: '#FFFFFF',
          lightGrey: '#F5F7FA',
          borderGrey: '#DFE5EB',
          whatsAppGreen: '#0BAA58',
          whatsAppHover: '#09934B',
          darkText: '#172B3A',
          mutedText: '#667585',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
