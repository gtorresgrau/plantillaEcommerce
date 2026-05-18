/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Los colores de marca se aplican via CSS variables (ver globals.css)
      // El superAdmin los edita en /super-admin/branding
      colors: {
        brand: {
          primary:    'var(--color-primary)',
          secondary:  'var(--color-secondary)',
          accent:     'var(--color-accent)',
          bg:         'var(--color-bg)',
          surface:    'var(--color-surface)',
          text:       'var(--color-text)',
          'text-muted': 'var(--color-text-muted)',
          nav:        'var(--color-nav)',
          'nav-text': 'var(--color-nav-text)',
          footer:     'var(--color-footer)',
          'footer-text': 'var(--color-footer-text)',
          danger:     'var(--color-danger)',
          success:    'var(--color-success)',
          warning:    'var(--color-warning)',
        },
      },
      fontFamily: {
        brand: ['var(--font-brand)', 'sans-serif'],
      },
      borderRadius: {
        brand: 'var(--border-radius)',
      },
    },
  },
  plugins: [],
};
