import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './App.vue';
import './global.scss';

// 定义路由
const routes = [
  {
    path: '/',
    name: 'start',
    component: () => import('./components/StartScreen.vue'),
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('./components/GameMain.vue'),
  },
  {
    path: '/character/:name',
    name: 'character',
    component: () => import('./components/CharacterDetail.vue'),
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('./components/HistoryMessages.vue'),
  },
  {
    path: '/worldbook',
    name: 'worldbook',
    component: () => import('./components/WorldbookManager.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('./components/SettingsPage.vue'),
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// 创建应用
const app = createApp(App);
app.use(createPinia());
app.use(router);

// 挂载应用
$(() => {
  app.mount('#app');
  console.info('[同层前端] 界面加载成功');
});

// 卸载处理
$(window).on('pagehide', () => {
  app.unmount();
  console.info('[同层前端] 界面卸载成功');
});
