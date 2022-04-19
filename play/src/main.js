import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

// import FleUi from "../../dist/fle-express-line-ui.umd";
// Vue.use(FleUi);

// import video from "../../packages/components/index";
// Vue.use(video)

import FleUi from "@fle-express-line-ui/components";
Vue.use(FleUi);

Vue.use(Element);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
