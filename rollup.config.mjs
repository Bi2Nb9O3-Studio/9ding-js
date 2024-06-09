import externals from "rollup-plugin-node-externals";
import resolve from "@rollup/plugin-node-resolve";
export default {
    input: "src/main.mjs",
    output: {
        file: "packageBuild/bundle.js",
        format: "esm",
        name: "9ding"
    },
    plugins: [
        resolve()
        // externals(),
    ]
};
