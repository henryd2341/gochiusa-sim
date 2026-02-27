import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './main.css';

$(() => {
  const app = createApp(App).use(createPinia());
  app.mount('#app');
  $(window).on('pagehide', () => app.unmount());
});
