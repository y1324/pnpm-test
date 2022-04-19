import commonjs from "@rollup/plugin-commonjs";
import vue from "rollup-plugin-vue";
import buble from "@rollup/plugin-buble";
import resolve from "rollup-plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import { accessSync, constants } from "fs";

// 判断文件是否存在
const fsExistsSync = (path) => {
  try {
    accessSync(path, constants.R_OK | constants.W_OK);
    console.log("can " + path);
    return true;
  } catch (e) {
    console.error("no access!");
    return false;
  }
};

const plugins = [
  resolve(),
  commonjs(),
  babel({
    exclude: "**/node_modules/**",
  }),
  vue({
    css: true,
    compileTemplate: true,
  }),
  buble({
    transforms: { asyncAwait: false },
  }),
  terser(),
];

// 复制一次就好，多次会报错。
if (!fsExistsSync("dist/assets")) {
  plugins.push(
    copy({
      targets: [{ src: "packages/components/hik-video/assets", dest: "dist" }],
      copyOnce: true,
    })
  );
}

export default {
  input: "packages/components/index.js",
  output: {
    name: "fleExpressLineUi",
    exports: "named",
  },
  plugins: plugins,
};
