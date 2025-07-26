import js from '@eslint/js';
import globals from 'globals';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
      semi: ['error', 'always'],
    },
  },
  {
    ignores: ['dist/'],
  },
);
