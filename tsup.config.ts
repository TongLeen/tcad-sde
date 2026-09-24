import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/index.ts"],
    format: ["cjs", "esm"], // 同时产出两种格式
    dts: true, // 生成类型声明
    sourcemap: true,
    clean: true, // 每次构建前清空 dist
    minify: false, // 库一般不建议压缩
    splitting: false,
    treeshake: true,
});
