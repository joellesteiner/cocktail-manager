module.exports = {
    transform: {
        "^.+\\.(js|ts|tsx)$": "babel-jest",  // Use Babel to transform JS, TS, and TSX files
    },
    testEnvironment: "node",  // Set the test environment to Node.js for backend code
    globals: {
        'ts-jest': {
            useBabelrc: true, // Let ts-jest use the Babel config if using TypeScript
        },
    },
    moduleFileExtensions: ["js", "json", "node"], // To make sure the extensions are recognized
};

