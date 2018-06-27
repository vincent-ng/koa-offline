module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "mocha": true,
    },
    "extends": "airbnb-base",
    "parserOptions": {
        "ecmaVersion": 8 // or 2017
    },
    "root": true,
    "rules": {
        "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
        "no-tabs": 0,
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ]
    }
};