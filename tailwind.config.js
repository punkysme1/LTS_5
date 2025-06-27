/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-light': '#E5E7EB',
        'primary-DEFAULT': '#6B7280',
        'primary-dark': '#374151',
        'secondary-light': '#F9FAFB',
        'secondary-DEFAULT': '#F3F4F6',
        'secondary-dark': '#D1D5DB',
        'accent-light': '#D1D5DB',
        'accent-DEFAULT': '#9CA3AF',
        'accent-dark': '#4B5563',
        'background-light': '#FFFFFF',
        'background-dark': '#111827',
        'text-DEFAULT': '#1F2937',
        'text-dark': '#F3F4F6',
      }
    }
  },
  plugins: [],
}
