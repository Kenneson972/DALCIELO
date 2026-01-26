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
          DEFAULT: '#E85D04',
          light: '#F77F00',
          lighter: '#FCBF49',
        },
        secondary: {
          DEFAULT: '#F77F00',
        },
        cream: '#FFF8F0',
        dark: '#1A1A1A',
        gray: {
          text: '#666666',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Quicksand', 'sans-serif'],
        accent: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #E85D04 0%, #F77F00 100%)',
        'gradient-tropical': 'linear-gradient(180deg, #F77F00 0%, #FCBF49 100%)',
      },
    },
  },
  plugins: [],
};
