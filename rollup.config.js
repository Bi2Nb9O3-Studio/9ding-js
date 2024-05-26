import externals from "rollup-plugin-node-externals";

export default {
    input: "src/main.js",
    output: {
        file: "bundle.js",
        format: "cjs",
    },
    plugins: [
        externals(),
    ],
};
