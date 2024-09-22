import externals from "rollup-plugin-node-externals";
import resolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
export default {
    input: "src/main.mjs",
    output: {
        file: "build/bundle.js",
        format: "esm",
        name: "9ding"
    },
    // onwarn: function (warning) {
    //     if (warning.code === "THIS_IS_UNDEFINED") {
    //         return;
    //     }
    //     console.error(warning.message);
    // },
    context: "window",
    plugins: [
        resolve(),
        postcss({
            // extract: "bundle.css",
            minimize: true
        })
        // externals(),
    ]
};
