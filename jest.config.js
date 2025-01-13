module.exports = {
        transform: {
            "^.+\\.(js|ts|tsx)$": "babel-jest"
        },
        testEnvironment: "node",
        globals: {
            'ts-jest': {
                useBabelrc: true,
            },

        },
};
