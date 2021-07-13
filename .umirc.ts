import { defineConfig } from "umi";

export default defineConfig({
  nodeModulesTransform: {
    type: "none",
  },
  fastRefresh: {},
  proxy: {
    "/api": {
      target: "http://127.0.0.1:8088/",
      changeOrigin: true,
    },
  },
  dva: {
    immer: false,
    hmr: false,
  },
  locale: {
    default: "zh-CN",
    antd: false,
    title: true,
    baseNavigator: true,
    baseSeparator: "-",
  },
});
