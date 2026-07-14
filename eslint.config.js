// @ts-check
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,

      // Enforced because this codebase will grow across many contributors/modules.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // We use console via our own logger utility.
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    // ── Design system enforcement ─────────────────────────────────────
    // Every embed and button in the bot must be created through src/ui/
    // (see src/ui/README.md) so the whole bot shares one visual language.
    // src/ui/** itself is exempt — it's the only place allowed to touch
    // these builders directly.
    files: ['src/**/*.ts'],
    ignores: ['src/ui/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='EmbedBuilder']",
          message:
            'Do not instantiate EmbedBuilder directly — use createEmbed()/embeds.* from ' +
            "src/ui instead, so every embed follows the shared design system.",
        },
        {
          selector: "NewExpression[callee.name='ButtonBuilder']",
          message:
            'Do not instantiate ButtonBuilder directly — use buttons.* from src/ui instead, ' +
            'so every button follows the shared design system.',
        },
        {
          selector: "NewExpression[callee.name='ButtonBuilder']",
          message:
            'Do not instantiate ButtonBuilder directly — use buttons.* from src/ui instead, ' +
            'so every button follows the shared design system.',
        },
        {
          selector: "NewExpression[callee.name='ChannelSelectMenuBuilder']",
          message:
            'Do not instantiate ChannelSelectMenuBuilder directly — use selectMenus.* from ' +
            'src/ui instead, so every select menu follows the shared design system.',
        },
        {
          selector: "NewExpression[callee.name='StringSelectMenuBuilder']",
          message:
            'Do not instantiate StringSelectMenuBuilder directly — use selectMenus.* from ' +
            'src/ui instead, so every select menu follows the shared design system.',
        },
        {
          selector: "NewExpression[callee.name='StringSelectMenuBuilder']",
          message:
            'Do not instantiate StringSelectMenuBuilder directly — use selectMenus.* from ' +
            'src/ui instead, so every select menu follows the shared design system.',
        },
        {
          selector: "NewExpression[callee.name='StringSelectMenuOptionBuilder']",
          message:
            'Do not instantiate StringSelectMenuOptionBuilder directly — build options ' +
            'through selectMenus.string() in src/ui instead.',
        },
        {
          selector: "NewExpression[callee.name='ModalBuilder']",
          message:
            'Do not instantiate ModalBuilder directly — use createModal() from src/ui ' +
            'instead, so every modal follows the shared design system.',
        },
      ],
    },
  },
  prettierConfig,
];
