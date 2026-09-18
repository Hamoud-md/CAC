/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--mbi-text-soft)',
            '--tw-prose-headings': 'var(--mbi-text)',
            '--tw-prose-lead': 'var(--mbi-text-soft)',
            '--tw-prose-links': 'var(--mbi-purple)',
            '--tw-prose-bold': 'var(--mbi-text)',
            '--tw-prose-counters': 'var(--mbi-text-muted)',
            '--tw-prose-bullets': 'var(--mbi-border)',
            '--tw-prose-hr': 'var(--mbi-border)',
            '--tw-prose-quotes': 'var(--mbi-text)',
            '--tw-prose-quote-borders': 'var(--mbi-border)',
            '--tw-prose-captions': 'var(--mbi-text-muted)',
            maxWidth: '46rem',
            h1: { fontWeight: '700', fontSize: '2.25rem', marginBottom: '0.5em', lineHeight: '1.15' },
            h2: { fontWeight: '700', fontSize: '1.5rem', lineHeight: '1.2' },
            h3: { fontWeight: '600', fontSize: '1.2rem' },
            a: { textDecoration: 'none', fontWeight: '600' },
            'a:hover': { textDecoration: 'underline' },
          },
        },
      }),
    },
  },
}

export default config
