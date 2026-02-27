import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import App from './App.vue';
import './global.scss';

type JQueryLike = {
  (handler: () => void): unknown;
  (target: Window): { on: (event: string, handler: () => void) => void };
};

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'start', component: () => import('./components/StartScreen.vue') },
    { path: '/game', name: 'game', component: () => import('./components/GameMain.vue') },
    { path: '/history', name: 'history', component: () => import('./components/HistoryMessages.vue') },
    { path: '/settings', name: 'settings', component: () => import('./components/SettingsPage.vue') },
  ],
});

const app = createApp(App);
app.use(createPinia());
app.use(router);

function getJQuery(): JQueryLike | null {
  const maybe$ = (globalThis as unknown as { $?: unknown }).$;
  return typeof maybe$ === 'function' ? (maybe$ as JQueryLike) : null;
}

function onReady(handler: () => void) {
  const $ = getJQuery();
  if ($) {
    $(handler);
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handler, { once: true });
  } else {
    handler();
  }
}

function onPageHide(handler: () => void) {
  const $ = getJQuery();
  if ($) {
    $(window).on('pagehide', handler);
    return;
  }
  window.addEventListener('pagehide', handler, { once: true });
}

function formatError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function renderFatalError(error: unknown) {
  const appEl = document.getElementById('app');
  if (!appEl) return;
  appEl.innerHTML = `
    <div style="padding:12px;border:1px solid #f0d4d4;border-radius:8px;background:#fff7f7;color:#7a3030;line-height:1.6;">
      <div style="font-weight:700;margin-bottom:6px;">同层前端启动失败</div>
      <div style="white-space:pre-wrap;word-break:break-word;">${formatError(error)}</div>
    </div>
  `;
}

async function bootstrap() {
  await router.replace('/');
  await router.isReady();
  app.mount('#app');
}

app.config.errorHandler = error => {
  console.error('[同层前端_v3] Vue 运行时错误:', error);
};

router.onError(error => {
  console.error('[同层前端_v3] 路由错误:', error);
});

onReady(() => {
  bootstrap().catch(error => {
    console.error('[同层前端_v3] 启动失败:', error);
    renderFatalError(error);
  });
});

onPageHide(() => {
  try {
    app.unmount();
  } catch (error) {
    console.warn('[同层前端_v3] 卸载异常:', error);
  }
});
