/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        'script': {
          'bg': '#f8f9fa',
          'text': '#2d3748',
          'heading': '#1a202c',
          'action': '#4a5568',
          'character': '#2b6cb0',
          'dialogue': '#2d3748',
          'parenthetical': '#718096',
        }
      }
    },
  },
  plugins: [],
}
