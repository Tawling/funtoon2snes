const path = require("path");

module.exports = {
    webpack: function override(config, env) {
        config.module.rules.push({
            test: /\.worker\.js$/,
            use: { loader: "worker-loader" },
        });
        return config;
    },
    // The fun2n build (src/funtoonServer.js) goes to build-fun2n/, so building
    // it never touches build/, which the legacy server serves as
    // /funtoon2snes/beta.
    paths: function (paths, env) {
        if (process.env.REACT_APP_FUNTOON_SERVER === "fun2n") {
            paths.appBuild = path.resolve(__dirname, "build-fun2n");
        }
        return paths;
    },
};
