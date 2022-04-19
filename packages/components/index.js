import FleHikVideo from "./hik-video/index";

const components = [FleHikVideo];

const install = function (Vue) {
  components.forEach((component) => {
    Vue.component(component.name, component);
  });
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export { FleHikVideo };

export default install;
