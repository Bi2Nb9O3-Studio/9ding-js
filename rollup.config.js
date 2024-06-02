import externals from "rollup-plugin-node-externals";
import resolve from "@rollup/plugin-node-resolve";
export default {
    input: "src/main.js",
    output: {
        file: "bundle.js",
        format: "umd",
        name: "9ding"
    },
    plugins: [
        resolve()
        // externals(),
    ]
};
