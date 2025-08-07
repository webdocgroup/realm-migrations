import js from '@eslint/js';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['**/build/**', '**/jest.config.js'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            eqeqeq: ['error', 'always'],
            semi: ['error', 'always', { switchCase: 1 }],
            indent: ['error', 4],
            'no-extra-semi': 'error',
            'no-implicit-coercion': [
                'error',
                {
                    boolean: true,
                    number: true,
                    string: true,
                },
            ],
            'no-lonely-if': 'error',
            'prefer-const': 'error',
            'spaced-comment': ['error', 'always'],
            'arrow-spacing': [
                'error',
                {
                    before: true,
                    after: true,
                },
            ],
            'eol-last': ['error', 'always'],
            'keyword-spacing': 'error',
            'no-trailing-spaces': 'error',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        files: ['*.ts', '*.tsx'],
        rules: {
            '@typescript-eslint/no-shadow': ['error'],
            'no-shadow': 'off',
            'no-undef': 'off',
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        // Packages `react` related packages come first.
                        // @see https://github.com/lydell/eslint-plugin-simple-import-sort#custom-grouping
                        ['^react', '^\\u0000', '^node:', '^@?\\w', '^', '^\\.'],
                    ],
                },
            ],
        },
    }
);
