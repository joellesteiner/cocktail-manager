module.exports = {
    root: true, // Ensures this is the root ESLint configuration
    parser: "@babel/eslint-parser", // Use Babel parser if needed
    parserOptions: {
        ecmaVersion: 2021, // Latest ECMAScript syntax
        sourceType: "module", // For ES Modules
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: [
        "eslint:recommended", // Base ESLint rules
        "plugin:react/recommended", // React-specific rules, if using React
    ],
    rules: {
        // Add or override specific linting rules
    },
    ignorePatterns: ["browserslist"], // Ignore the browserslist key
};
