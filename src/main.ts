import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { router } from './router';
import VueLazyload from 'vue-lazyload';

createApp(App)
  .use(createPinia())
  .use(router)
  .use(VueLazyload)
  .mount('#app');