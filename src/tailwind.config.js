module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
      extend: {
        colors: {
          'brown': {
            100: '#D7CCC8',
            200: '#BCAAA4',
            300: '#A1887F',
            400: '#8D6E63',
            500: '#795548',
            600: '#6D4C41',
            700: '#5D4037',
            800: '#4E342E',
            900: '#3E2723',
          },
          'fruit': {
            'watermelon': '#ff6b6b',
            'tomato': '#e74c3c',
            'eggplant': '#6f42c1',
            'orange': '#fd7e14',
            'banana': '#ffd43b',
            'apple': '#e53e3e',
            'cherry': '#c53030',
            'strawberry': '#e53e3e',
            'pineapple': '#f59f00',
          }
        },
        fontFamily: {
          'game': ['Bubblegum Sans', 'cursive'],
          'display': ['Fredoka One', 'cursive'],
        },
        animation: {
          'bounce-slow': 'bounce 3s infinite',
          'float': 'float 3s ease-in-out infinite',
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'spin-slow': 'spin 3s linear infinite',
        },
        keyframes: {
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          }
        },
        boxShadow: {
          'wooden': '0 4px 0 #4E342E, 0 6px 10px rgba(0,0,0,0.25)',
          'pressed': '0 2px 0 #4E342E, 0 3px 6px rgba(0,0,0,0.25)',
        },
        backgroundImage: {
          'wooden-pattern': "url('/src/assets/ui/wooden-panel.png')",
        },
        perspective: {
          '800': '800px',
        },
        rotate: {
          '5': '5deg',
        }
      },
    },
    plugins: [
      function ({ addUtilities }) {
        const newUtilities = {
          '.perspective-800': {
            perspective: '800px',
          },
          '.rotateX-5': {
            transform: 'rotateX(5deg)',
          },
        }
        addUtilities(newUtilities)
      }
    ],
  };