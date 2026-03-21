module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E17B5F',
          light: '#D4633F',
          lighter: '#F4D06F',
          text: '#C54A35',
        },
        secondary: {
          DEFAULT: '#D4633F',
        },
        cream: '#FFF8F0',
        dark: '#3D2418',
        gray: {
          text: '#666666',
        },
        coral: '#E17B5F',
        'burnt-orange': '#D4633F',
        peach: '#F4A088',
        'green-palm': '#8BB174',
        'yellow-sun': '#F4D06F',
        'brown-wood': '#8B5A3C',
        'text-dark': '#3D2418',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Quicksand', 'sans-serif'],
        accent: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E17B5F 0%, #D4633F 100%)',
        'gradient-tropical': 'linear-gradient(180deg, #D4633F 0%, #F4D06F 100%)',
      },
    },
  },
  plugins: [],
};
