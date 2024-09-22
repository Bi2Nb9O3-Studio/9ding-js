import externals from "rollup-plugin-node-externals";
import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import uglify from "@lopatnov/rollup-plugin-uglify";
// import obfuscator from "rollup-plugin-javascript-obfuscator";

export default {
    input: "src/main.mjs",
    output: {
        file: "build/bundle.js",
        format: "esm",
        name: "9ding"
    },
    context: "window",
    plugins: [
        resolve(),
        postcss({
            // extract: "bundle.css",
            minimize: true
        }),
        uglify(),
        // obfuscator()
        // externals(),
    ]
};