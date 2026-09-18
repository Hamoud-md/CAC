import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    // Existing effects predate the Next 16 flat config. Keep them visible as
    // warnings while enforcing the rule on new and other components.
    files: [
      'src/Header/CategoryNav.tsx',
      'src/Header/Component.client.tsx',
      'src/components/Ads/AdCreativeCarousel.tsx',
      'src/providers/Theme/ThemeSelector/index.tsx',
      'src/providers/Theme/index.tsx',
    ],
    rules: { 'react-hooks/set-state-in-effect': 'warn' },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: ['.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts'],
  },
]

export default eslintConfig
