<template>
  <div
    id="page-game-root"
    :data-theme="settings.theme"
    data-font="font-ui-default"
    :data-reduced-motion="settings.reduceMotion ? 'true' : 'false'"
    :style="pageRootStyle"
  >
    <div class="background-layer">
      <div class="bg-gradient"></div>
    </div>

    <transition name="fade">
      <section v-if="isSplashScreenVisible" class="splash-screen">
        <div class="splash-logo animate-fadeInDown">
          <h1 class="splash-title">ご注文はうさぎですか？</h1>
          <p class="splash-subtitle">请问您今天要来点兔子吗？</p>
        </div>
        <button class="press-start-btn animate-fadeInUp" @click="handleStart">
          <span class="animate-pulse">PRESS START</span>
        </button>
      </section>
    </transition>

    <h1 id="page-main-title" class="sr-only">点兔文字交互主页面</h1>

    <header id="region-top-nav" role="banner" aria-label="顶部导航">
      <div id="brand-logo-wrap" aria-label="品牌标识">
        <span class="brand-main">叙事界面</span>
        <small class="brand-sub">沉浸式文字交互</small>
      </div>

      <nav id="nav-feature-entry" aria-label="功能入口">
        <button id="btn-open-tab-history" type="button" class="btn nav-btn" @click="openFeatureModal('history')">
          <i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
          <span>历史</span>
        </button>
        <button id="btn-open-tab-worldbook" type="button" class="btn nav-btn" @click="openFeatureModal('worldbook')">
          <i class="fa-solid fa-book-open" aria-hidden="true"></i>
          <span>世界书</span>
        </button>
        <button id="btn-open-tab-settings" type="button" class="btn nav-btn" @click="openFeatureModal('settings')">
          <i class="fa-solid fa-gear" aria-hidden="true"></i>
          <span>设置</span>
        </button>
      </nav>
    </header>

    <main id="region-main-content" role="main">
      <section id="panel-story-feed" aria-labelledby="heading-story-feed" class="card panel-story">
        <div class="panel-head-row">
          <h2 id="heading-story-feed">叙事消息</h2>
          <button
            id="btn-refresh-story"
            type="button"
            class="btn panel-mini-btn"
            @click="refreshLatestAssistantMessage"
          >
            同步楼层
          </button>
        </div>
        <article id="story-current-message" aria-live="polite" :aria-busy="isBusyGenerating ? 'true' : 'false'">
          {{ displayedMessage }}
        </article>
      </section>

      <section id="panel-option-actions" aria-labelledby="heading-option-actions" class="card panel-options">
        <div class="panel-head-row">
          <h2 id="heading-option-actions">可选行动</h2>
          <span v-if="isBusyGenerating" id="status-generating" class="status-chip" aria-live="assertive"
            >正在生成回复</span
          >
        </div>

        <ul id="list-option-cards" class="option-list">
          <li v-for="(option, index) in options" :key="option.id">
            <button
              :id="`option-card-${String(index + 1).padStart(3, '0')}`"
              class="btn option-card"
              type="button"
              :disabled="isBusyGenerating"
              @click="handleOption(option.content)"
            >
              <strong>{{ option.title }}</strong>
              <span>{{ option.content }}</span>
            </button>
          </li>
        </ul>

        <div class="custom-option-row">
          <label for="input-custom-option" class="sr-only">自定义选项内容</label>
          <textarea
            id="input-custom-option"
            v-model="customOption"
            rows="2"
            placeholder="输入自定义行动..."
            aria-label="自定义选项内容"
            :disabled="isBusyGenerating"
          ></textarea>
          <button
            id="btn-add-custom-option"
            type="button"
            class="btn"
            :disabled="isBusyGenerating"
            @click="submitCustomOption"
          >
            发送行动
          </button>
        </div>
      </section>

      <aside id="panel-character-status" aria-labelledby="heading-character-status" class="card panel-characters">
        <div class="char-head-row">
          <h2 id="heading-character-status">角色状态</h2>
        </div>

        <ul id="list-character-avatars" class="avatar-list">
          <li v-for="item in characterProfiles" :key="item.key">
            <button
              :id="`avatar-item-${item.key}`"
              type="button"
              class="btn avatar-chip"
              :style="{ '--chip-color': item.color }"
              @click="openCharacterDetail(item.key)"
            >
              <span class="avatar-thumb-wrap" aria-hidden="true">
                <img
                  :id="`avatar-img-${item.key}`"
                  class="avatar-thumb"
                  :src="item.avatarUrl"
                  :alt="`${item.name}头像`"
                  loading="lazy"
                  decoding="async"
                  @error="onAvatarImageError($event, item.name)"
                />
              </span>
              <span class="avatar-name">{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </aside>
    </main>

    <footer id="region-quick-actions" aria-label="快捷操作" class="quick-actions">
      <button id="btn-toggle-fullscreen" type="button" class="btn" title="全屏" @click="toggleFullscreen">全屏</button>
      <button
        id="btn-toggle-autoscroll"
        type="button"
        class="btn"
        :title="settings.autoScroll ? '关闭自动滚动' : '开启自动滚动'"
        @click="settings.autoScroll = !settings.autoScroll"
      >
        自动滚动
      </button>
      <button id="btn-toggle-typewriter" type="button" class="btn" title="切换显示模式" @click="toggleDisplayMode">
        显示模式
      </button>
      <button
        id="btn-open-feature-modal"
        type="button"
        class="btn"
        title="功能面板"
        @click="openFeatureModal('history')"
      >
        功能面板
      </button>
    </footer>

    <section
      v-if="isFeatureModalVisible"
      id="layer-feature-modal"
      role="dialog"
      aria-modal="true"
      aria-label="功能面板"
      class="modal-scrim"
      @click.self="closeFeatureModal"
      @keydown="trapFocusInModal($event, 'layer-feature-modal')"
    >
      <div class="modal-shell" tabindex="-1">
        <header class="modal-header">
          <h2 id="modal-feature-title">功能面板</h2>
          <button id="btn-close-feature-modal" type="button" class="btn" @click="closeFeatureModal">关闭</button>
        </header>

        <nav class="tab-nav" aria-label="功能标签页">
          <button
            id="modal-tab-history"
            type="button"
            class="btn"
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            历史消息
          </button>
          <button
            id="modal-tab-worldbook"
            type="button"
            class="btn"
            :class="{ active: activeTab === 'worldbook' }"
            @click="activeTab = 'worldbook'"
          >
            世界书管理
          </button>
          <button
            id="modal-tab-settings"
            type="button"
            class="btn"
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
          >
            设置
          </button>
          <button
            id="modal-tab-character"
            type="button"
            class="btn"
            :class="{ active: activeTab === 'character' }"
            @click="activeTab = 'character'"
          >
            角色详情
          </button>
        </nav>

        <section v-if="activeTab === 'history'" id="panel-tab-history" class="tab-panel" aria-live="polite">
          <h3>历史消息</h3>
          <div class="panel-tools">
            <label for="input-history-search" class="sr-only">搜索历史消息</label>
            <input
              id="input-history-search"
              v-model.trim="historyQuery"
              type="search"
              placeholder="输入关键字筛选历史消息"
            />
            <button id="btn-history-refresh" type="button" class="btn" @click="loadHistory(true)">刷新</button>
          </div>

          <ul id="list-history-messages" class="history-list">
            <li v-for="msg in historyFilteredMessages" :key="`history-${msg.message_id}`">
              <article :id="`history-item-${msg.message_id}`" class="history-card">
                <header>
                  <span class="badge">第{{ msg.message_id }}楼</span>
                  <span class="badge muted">{{ roleLabel(msg.role) }}</span>
                  <span class="badge muted">{{ msg.name || '未知角色' }}</span>
                </header>
                <p>{{ truncateText(msg.message, 160) }}</p>
                <button
                  :id="`btn-history-use-${msg.message_id}`"
                  type="button"
                  class="btn panel-mini-btn"
                  @click="useHistoryAsCustom(msg.message)"
                >
                  引用到自定义选项
                </button>
              </article>
            </li>
          </ul>

          <div class="panel-actions-row">
            <button
              id="btn-history-load-more"
              type="button"
              class="btn"
              :disabled="!historyHasMore"
              @click="loadMoreHistory"
            >
              加载更多
            </button>
          </div>
        </section>

        <section v-else-if="activeTab === 'worldbook'" id="panel-tab-worldbook" class="tab-panel" aria-live="polite">
          <h3>世界书管理</h3>
          <div class="panel-tools">
            <label for="select-worldbook" class="sr-only">选择世界书</label>
            <select id="select-worldbook" v-model="selectedWorldbookName">
              <option v-for="name in worldbookNames" :key="name" :value="name">{{ name }}</option>
            </select>
            <label for="input-worldbook-search" class="sr-only">搜索世界书条目</label>
            <input
              id="input-worldbook-search"
              v-model.trim="worldbookQuery"
              type="search"
              placeholder="搜索条目名称或内容"
            />
            <button id="btn-worldbook-refresh" type="button" class="btn" @click="reloadWorldbook">刷新</button>
          </div>

          <p v-if="worldbookError" class="inline-error">{{ worldbookError }}</p>
          <p v-else-if="isWorldbookLoading" class="inline-tip">世界书读取中...</p>

          <ul id="list-worldbook-entries" class="worldbook-list">
            <li v-for="entry in filteredWorldbookEntries" :key="entry.uid">
              <article :id="`worldbook-entry-${entry.uid}`" class="worldbook-card">
                <header>
                  <strong>{{ entry.name || `未命名条目-${entry.uid}` }}</strong>
                  <button
                    :id="`btn-worldbook-toggle-${entry.uid}`"
                    type="button"
                    class="btn panel-mini-btn"
                    @click="toggleWorldbookEntryState(entry.uid, !entry.enabled)"
                  >
                    {{ entry.enabled ? '已启用' : '已禁用' }}
                  </button>
                </header>
                <p>{{ truncateText(entry.content, 120) }}</p>
                <div class="entry-meta">
                  <span>策略：{{ entry.strategy.type }}</span>
                  <span>概率：{{ entry.probability }}%</span>
                </div>
              </article>
            </li>
          </ul>
        </section>

        <section v-else-if="activeTab === 'settings'" id="panel-tab-settings" class="tab-panel" aria-live="polite">
          <h3>设置</h3>
          <form id="form-ui-settings" class="settings-grid" @submit.prevent>
            <fieldset class="setting-group">
              <legend>主题风格</legend>
              <label>
                <input id="radio-theme-latte" v-model="settings.theme" type="radio" value="theme-latte-noir" />
                奶油白昼
              </label>
              <label>
                <input id="radio-theme-midnight" v-model="settings.theme" type="radio" value="theme-midnight-salon" />
                午夜沙龙
              </label>
            </fieldset>

            <fieldset class="setting-group">
              <legend>消息显示</legend>
              <label>
                <input id="radio-mode-instant" v-model="settings.displayMode" type="radio" value="instant" />
                即时显示
              </label>
              <label>
                <input id="radio-mode-typewriter" v-model="settings.displayMode" type="radio" value="typewriter" />
                打字机
              </label>
              <label>
                <input id="radio-mode-segment" v-model="settings.displayMode" type="radio" value="segment" />
                分段显示
              </label>
            </fieldset>

            <fieldset class="setting-group">
              <legend>字体大小</legend>
              <label>
                <input id="radio-font-small" v-model="settings.fontScale" type="radio" value="small" />
                小
              </label>
              <label>
                <input id="radio-font-medium" v-model="settings.fontScale" type="radio" value="medium" />
                中
              </label>
              <label>
                <input id="radio-font-large" v-model="settings.fontScale" type="radio" value="large" />
                大
              </label>
            </fieldset>

            <fieldset class="setting-group">
              <legend>交互偏好</legend>
              <label>
                <input id="check-auto-scroll" v-model="settings.autoScroll" type="checkbox" />
                自动滚动
              </label>
              <label>
                <input id="check-reduced-motion" v-model="settings.reduceMotion" type="checkbox" />
                减少动效
              </label>
            </fieldset>
          </form>
          <div class="panel-actions-row">
            <button id="btn-reset-settings" type="button" class="btn" @click="resetSettings">重置默认设置</button>
          </div>
        </section>

        <section v-else id="panel-tab-character" class="tab-panel" aria-live="polite">
          <h3>角色详情</h3>
          <div class="character-panel">
            <ul class="character-selector">
              <li v-for="item in characterProfiles" :key="`detail-${item.key}`">
                <button
                  :id="`btn-character-focus-${item.key}`"
                  type="button"
                  class="btn"
                  :class="{ active: activeCharacterKey === item.key }"
                  @click="activeCharacterKey = item.key"
                >
                  {{ item.name }}
                </button>
              </li>
            </ul>

            <article id="panel-character-detail-card" class="character-detail-card">
              <div class="character-hero" aria-hidden="true">
                <img
                  id="img-character-detail"
                  :src="activeCharacter.avatarUrl"
                  :alt="`${activeCharacter.name}立绘`"
                  loading="lazy"
                  decoding="async"
                  @error="onAvatarImageError($event, activeCharacter.name)"
                />
              </div>
              <h4>{{ activeCharacter.name }}</h4>
              <p>{{ activeCharacter.summary }}</p>
              <dl>
                <dt>心情</dt>
                <dd>{{ activeCharacterState.mood }}</dd>
                <dt>位置</dt>
                <dd>{{ activeCharacterState.location }}</dd>
                <dt>着装</dt>
                <dd>{{ activeCharacterState.outfit }}</dd>
                <dt>关系</dt>
                <dd>{{ activeCharacterState.relation }}</dd>
              </dl>
            </article>
          </div>
        </section>
      </div>
    </section>

    <section
      v-if="showPerspectiveSelector"
      id="layer-perspective-modal"
      role="dialog"
      aria-modal="true"
      aria-label="主视角选择"
      class="modal-scrim perspective"
      @keydown="trapFocusInModal($event, 'layer-perspective-modal')"
    >
      <div class="modal-shell perspective-shell" tabindex="-1">
        <header class="modal-header">
          <h2 id="heading-perspective-selector">请选择主视角</h2>
        </header>
        <p class="perspective-tip">首次进入当前聊天且最高楼层为0时，需要先选择主视角后再发送行动。</p>

        <ul class="perspective-list">
          <li v-for="item in perspectiveEntries" :key="item.key">
            <button
              :id="`btn-select-perspective-${item.key}`"
              type="button"
              class="btn perspective-card"
              :class="{ active: selectedPerspective === item.key }"
              @click="selectedPerspective = item.key"
            >
              <strong>{{ item.key }}</strong>
              <span>{{ item.description }}</span>
            </button>
          </li>
        </ul>

        <div class="opening-preview-wrap" aria-live="polite">
          <h3 id="heading-opening-preview">开场白预览</h3>
          <p id="text-opening-preview">{{ selectedOpeningPreview }}</p>
        </div>

        <button
          id="btn-confirm-perspective"
          type="button"
          class="btn confirm-btn"
          :disabled="!selectedPerspective"
          @click="confirmPerspective"
        >
          确认主视角
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import openingConfigRaw from './config/opening_by_perspective.yaml';

type FeatureTabKey = 'history' | 'worldbook' | 'settings' | 'character';
type DisplayMode = 'instant' | 'typewriter' | 'segment';
type ThemeMode = 'theme-latte-noir' | 'theme-midnight-salon';
type FontScale = 'small' | 'medium' | 'large';
type PerspectiveKey = '心爱' | '智乃' | '理世' | '千夜' | '纱路' | '无';

type PerspectiveEntry = {
  description: string;
  opening: string;
};

type OpeningConfig = {
  perspectives: Record<PerspectiveKey, PerspectiveEntry>;
};

type RoleplayOption = {
  id: string;
  title: string;
  content: string;
};

type UISettings = {
  theme: ThemeMode;
  displayMode: DisplayMode;
  fontScale: FontScale;
  autoScroll: boolean;
  reduceMotion: boolean;
};

type CharacterProfile = {
  key: string;
  name: string;
  color: string;
  avatarUrl: string;
  summary: string;
  mood: string;
  location: string;
  outfit: string;
  relation: string;
};

const perspectiveKeys: PerspectiveKey[] = ['心爱', '智乃', '理世', '千夜', '纱路', '无'];

const fallbackOpeningConfig: OpeningConfig = {
  perspectives: {
    心爱: {
      description: '以保登心爱的情绪与语气观察事件发展，优先关注热情、主动与当下氛围。',
      opening: '你在清晨推开兔屋咖啡馆的大门，熟悉的甜香与轻快脚步声同时向你迎来。',
    },
    智乃: {
      description: '以香风智乃的克制与细腻感知推进剧情，优先关注细节与隐含情绪变化。',
      opening: '你端正地整理围裙与托盘，抬眼时，门铃正好响起，今天的第一位客人到了。',
    },
    理世: {
      description: '以天天座理世的执行力推进剧情，优先处理秩序、任务与突发状况。',
      opening: '你快速扫视店内座位与动线，确认一切就绪后，今天的营业正式开始。',
    },
    千夜: {
      description: '以宇治松千夜的温婉风格观察互动，优先关注礼节、安抚与氛围调和。',
      opening: '你轻轻摆好茶点，窗外风铃声细微晃动，一段柔和却重要的对话即将开始。',
    },
    纱路: {
      description: '以桐间纱路的谨慎与责任感参与剧情，优先关注风险与规则边界。',
      opening: '你深呼吸后推门而入，尽量让自己的步伐显得从容，不让紧张暴露在表情里。',
    },
    无: {
      description: '使用中立视角，不绑定具体角色语气，更适合观察多角色并行叙事。',
      opening: '午后钟声落下，你推门进入熟悉的咖啡馆，空气里有甜点与咖啡的暖香。',
    },
  },
};

const defaultSettings: UISettings = {
  theme: 'theme-latte-noir',
  displayMode: 'instant',
  fontScale: 'medium',
  autoScroll: true,
  reduceMotion: false,
};

const SETTINGS_STORAGE_KEY = 'gochiusa.frontend.settings.v2';
const PERSPECTIVE_VAR_PATH = '前端界面.主视角';

function catboxImage(code: string): string {
  return `https://files.catbox.moe/${code}.png`;
}

const characterProfiles: CharacterProfile[] = [
  {
    key: 'cocoa',
    name: '保登心爱',
    color: 'var(--clr-cocoa)',
    avatarUrl: catboxImage('qjltca'),
    summary: '活力型引导角色，擅长快速拉近关系并推动场景气氛。',
    mood: '开朗',
    location: '兔屋咖啡馆前厅',
    outfit: '咖啡厅制服',
    relation: '友好',
  },
  {
    key: 'chino',
    name: '香风智乃',
    color: 'var(--clr-chino)',
    avatarUrl: catboxImage('6t09pw'),
    summary: '观察型角色，擅长在安静场景中提供高价值细节。',
    mood: '冷静',
    location: '吧台内侧',
    outfit: '咖啡厅制服',
    relation: '信任建立中',
  },
  {
    key: 'rize',
    name: '天天座理世',
    color: 'var(--clr-rize)',
    avatarUrl: catboxImage('n9szhx'),
    summary: '执行型角色，擅长处理节奏与秩序相关场景。',
    mood: '专注',
    location: '点单与出餐动线',
    outfit: '咖啡厅制服',
    relation: '可靠同伴',
  },
  {
    key: 'chiya',
    name: '宇治松千夜',
    color: 'var(--clr-chiya)',
    avatarUrl: catboxImage('v4spnt'),
    summary: '情绪调和型角色，擅长缓冲冲突与提升舒适感。',
    mood: '温和',
    location: '甜点展示区',
    outfit: '和风改良制服',
    relation: '亲近',
  },
  {
    key: 'syaro',
    name: '桐间纱路',
    color: 'var(--clr-syaro)',
    avatarUrl: catboxImage('b982xz'),
    summary: '谨慎型角色，适合调查、推理与高压交互场景。',
    mood: '紧张但坚定',
    location: '门厅与过道',
    outfit: '学院日常装',
    relation: '逐步加深',
  },
];

const perspectiveToCharacter: Record<PerspectiveKey, string> = {
  心爱: 'cocoa',
  智乃: 'chino',
  理世: 'rize',
  千夜: 'chiya',
  纱路: 'syaro',
  无: 'cocoa',
};

function isPerspectiveKey(value: unknown): value is PerspectiveKey {
  return perspectiveKeys.includes(value as PerspectiveKey);
}

function normalizeOpeningConfig(input: unknown): OpeningConfig {
  const base = _.cloneDeep(fallbackOpeningConfig);
  if (!input || typeof input !== 'object') return base;

  const raw = (input as { perspectives?: Record<string, PerspectiveEntry> }).perspectives;
  if (!raw || typeof raw !== 'object') return base;

  perspectiveKeys.forEach(key => {
    const candidate = raw[key];
    if (
      candidate &&
      typeof candidate.description === 'string' &&
      candidate.description.trim().length > 0 &&
      typeof candidate.opening === 'string' &&
      candidate.opening.trim().length > 0
    ) {
      base.perspectives[key] = { description: candidate.description, opening: candidate.opening };
    }
  });

  return base;
}

function loadSettings(): UISettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<UISettings>;
    return {
      theme: parsed.theme === 'theme-midnight-salon' ? 'theme-midnight-salon' : 'theme-latte-noir',
      displayMode:
        parsed.displayMode === 'typewriter' || parsed.displayMode === 'segment' ? parsed.displayMode : 'instant',
      fontScale: parsed.fontScale === 'small' || parsed.fontScale === 'large' ? parsed.fontScale : 'medium',
      autoScroll: parsed.autoScroll !== false,
      reduceMotion: parsed.reduceMotion === true,
    };
  } catch {
    return defaultSettings;
  }
}

function upsertMetaDescription(content: string): void {
  const selector = 'meta[name="description"]';
  let meta = document.head.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function segmentText(input: string): string {
  return input
    .replace(/([。！？!?])(?=[^\n])/g, '$1\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function roleLabel(role: ChatMessage['role']): string {
  if (role === 'assistant') return '助手';
  if (role === 'user') return '玩家';
  return '系统';
}

function truncateText(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function onAvatarImageError(event: Event, characterName: string): void {
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.onerror = null;
  target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(characterName)}`;
}

function extractRoleplayOptions(message: string): RoleplayOption[] {
  const block = message.match(/<roleplay_options>([\s\S]*?)<\/roleplay_options>/i)?.[1] ?? '';
  if (!block.trim()) return [];

  return [...block.matchAll(/(.+?)[:：]\s*(.+)/g)].map((match, index) => ({
    id: `opt-dynamic-${index + 1}`,
    title: match[1].trim(),
    content: match[2].trim(),
  }));
}

const openingConfig = normalizeOpeningConfig(openingConfigRaw);
const settings = ref<UISettings>(loadSettings());

const isCharacterDockCollapsed = ref(false);
const isFeatureModalVisible = ref(false);
const activeTab = ref<FeatureTabKey>('history');
const showPerspectiveSelector = ref(false);
const isSplashScreenVisible = ref(true);
const selectedPerspective = ref<PerspectiveKey | null>(null);
const perspectiveConfirmed = ref(false);
const customOption = ref('');
const isFullscreen = ref(false);
const isBusyGenerating = ref(false);

const rawCurrentMessage = ref('正在等待剧情推进，请选择下一步行动。');
const displayedMessage = ref('正在等待剧情推进，请选择下一步行动。');

const activeCharacterKey = ref<string>('cocoa');
const chatVariablesSnapshot = ref<Record<string, any>>({});

const historyMessages = ref<ChatMessage[]>([]);
const historyDepth = ref(40);
const historyQuery = ref('');

const worldbookNames = ref<string[]>([]);
const selectedWorldbookName = ref('');
const worldbookEntries = ref<WorldbookEntry[]>([]);
const worldbookQuery = ref('');
const worldbookError = ref('');
const isWorldbookLoading = ref(false);
const lastMessageId = ref(0);

const options = ref<RoleplayOption[]>([
  { id: 'opt-001', title: '向柜台点单', content: '你走向柜台，礼貌地询问今日推荐饮品。' },
  { id: 'opt-002', title: '观察店内', content: '你放慢脚步，观察店内客人与角色之间的互动细节。' },
  { id: 'opt-003', title: '主动搭话', content: '你选择与当前出场角色展开一段自然交流。' },
]);

const fontScaleMap: Record<FontScale, string> = {
  small: '0.92',
  medium: '1',
  large: '1.08',
};

const pageRootStyle = computed(() => ({
  '--font-scale': fontScaleMap[settings.value.fontScale],
}));

const perspectiveEntries = computed(() => {
  return perspectiveKeys.map(key => ({
    key,
    ...openingConfig.perspectives[key],
  }));
});

const selectedOpeningPreview = computed(() => {
  const key = selectedPerspective.value;
  if (!key) return '请选择一个主视角后查看对应开场白。';
  return openingConfig.perspectives[key].opening;
});

const displayModeLabel = computed(() => {
  if (settings.value.displayMode === 'typewriter') return '显示模式：打字机';
  if (settings.value.displayMode === 'segment') return '显示模式：分段';
  return '显示模式：即时';
});

const historyFilteredMessages = computed(() => {
  const keyword = historyQuery.value.trim().toLowerCase();
  const sorted = [...historyMessages.value].sort((lhs, rhs) => rhs.message_id - lhs.message_id);
  if (!keyword) return sorted;

  return sorted.filter(msg => {
    const text = `${msg.name} ${msg.message}`.toLowerCase();
    return text.includes(keyword);
  });
});

const historyHasMore = computed(() => {
  return historyDepth.value < lastMessageId.value + 1;
});

const filteredWorldbookEntries = computed(() => {
  const keyword = worldbookQuery.value.trim().toLowerCase();
  if (!keyword) return worldbookEntries.value;

  return worldbookEntries.value.filter(entry => {
    const text = `${entry.name} ${entry.content}`.toLowerCase();
    return text.includes(keyword);
  });
});

const activeCharacter = computed(() => {
  const match = characterProfiles.find(item => item.key === activeCharacterKey.value);
  return match ?? characterProfiles[0];
});

const activeCharacterState = computed(() => {
  const profile = activeCharacter.value;
  const vars = chatVariablesSnapshot.value;

  const mood =
    _.get(vars, `${profile.name}.心情`) ??
    _.get(vars, `角色状态.${profile.name}.心情`) ??
    _.get(vars, `角色.${profile.name}.心情`) ??
    profile.mood;

  const location =
    _.get(vars, `${profile.name}.位置`) ??
    _.get(vars, `角色状态.${profile.name}.位置`) ??
    _.get(vars, `角色.${profile.name}.位置`) ??
    profile.location;

  const outfit =
    _.get(vars, `${profile.name}.着装`) ??
    _.get(vars, `角色状态.${profile.name}.着装`) ??
    _.get(vars, `角色.${profile.name}.着装`) ??
    profile.outfit;

  const relation =
    _.get(vars, `${profile.name}.关系`) ??
    _.get(vars, `角色状态.${profile.name}.关系`) ??
    _.get(vars, `角色.${profile.name}.关系`) ??
    profile.relation;

  return {
    mood: String(mood),
    location: String(location),
    outfit: String(outfit),
    relation: String(relation),
  };
});

const eventStops: Array<() => void> = [];
let typewriterTimer: number | null = null;
let lastFocusedElement: HTMLElement | null = null;

function clearTypewriterTimer(): void {
  if (typewriterTimer === null) return;
  window.clearInterval(typewriterTimer);
  typewriterTimer = null;
}

function applyDisplayMessage(text: string): void {
  clearTypewriterTimer();

  if (settings.value.displayMode === 'instant') {
    displayedMessage.value = text;
    return;
  }

  if (settings.value.displayMode === 'segment') {
    displayedMessage.value = segmentText(text);
    return;
  }

  const chars = Array.from(text);
  displayedMessage.value = '';
  let index = 0;

  typewriterTimer = window.setInterval(
    () => {
      index += 1;
      displayedMessage.value = chars.slice(0, index).join('');
      if (index >= chars.length) {
        clearTypewriterTimer();
      }
    },
    settings.value.reduceMotion ? 8 : 20,
  );
}

function saveSettings(): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value));
}

function resetSettings(): void {
  settings.value = _.cloneDeep(defaultSettings);
  saveSettings();
  toastr.success('设置已恢复默认值。');
}

function toggleDisplayMode(): void {
  const chain: DisplayMode[] = ['instant', 'typewriter', 'segment'];
  const index = chain.indexOf(settings.value.displayMode);
  settings.value.displayMode = chain[(index + 1) % chain.length];
}

function readPerspectiveFromChatVariables(): PerspectiveKey | null {
  try {
    const vars = getVariables({ type: 'chat' });
    const value = _.get(vars, PERSPECTIVE_VAR_PATH);
    return isPerspectiveKey(value) ? value : null;
  } catch {
    return null;
  }
}

function syncLastMessageId(): number {
  const value = getLastMessageId();
  lastMessageId.value = value;
  return value;
}

function persistPerspectiveToChatVariables(value: PerspectiveKey): void {
  try {
    updateVariablesWith(
      vars => {
        _.set(vars, PERSPECTIVE_VAR_PATH, value);
        return vars;
      },
      { type: 'chat' },
    );
  } catch (error) {
    console.warn('保存主视角到聊天变量失败:', error);
  }
}

function shouldShowPerspectiveModal(): boolean {
  return syncLastMessageId() === 0;
}

function getPerspectiveOpening(): string {
  const key = selectedPerspective.value ?? '无';
  return openingConfig.perspectives[key].opening;
}

function confirmPerspective(): void {
  if (!selectedPerspective.value) return;

  perspectiveConfirmed.value = true;
  showPerspectiveSelector.value = false;
  persistPerspectiveToChatVariables(selectedPerspective.value);

  const mapped = perspectiveToCharacter[selectedPerspective.value];
  if (mapped) activeCharacterKey.value = mapped;

  if (syncLastMessageId() === 0) {
    rawCurrentMessage.value = getPerspectiveOpening();
    updateOptionsFromMessage(rawCurrentMessage.value);
  }

  toastr.success(`主视角已确定：${selectedPerspective.value}`);
}

function loadHistory(reset = false): void {
  if (reset) {
    historyDepth.value = 40;
  }

  const lastId = syncLastMessageId();
  const start = Math.max(0, lastId - historyDepth.value + 1);
  const range = `${start}-${lastId}`;

  historyMessages.value = getChatMessages(range, { hide_state: 'unhidden' }) as ChatMessage[];
}

function loadMoreHistory(): void {
  historyDepth.value += 40;
  loadHistory(false);
}

function useHistoryAsCustom(message: string): void {
  customOption.value = message;
  closeFeatureModal();
  toastr.info('已将历史消息填入自定义选项输入框。');
}

async function loadWorldbookNames(): Promise<void> {
  const names: string[] = [];
  try {
    const bind = getCharWorldbookNames('current');
    names.push(...[bind.primary, ...bind.additional].filter((item): item is string => Boolean(item)));
  } catch {
    // 当前没有可用角色卡时会走到这里，使用全量世界书兜底
  }

  if (!names.length) {
    names.push(...getWorldbookNames());
  }

  worldbookNames.value = Array.from(new Set(names));
  if (!worldbookNames.value.length) {
    selectedWorldbookName.value = '';
    worldbookEntries.value = [];
    return;
  }

  if (!worldbookNames.value.includes(selectedWorldbookName.value)) {
    selectedWorldbookName.value = worldbookNames.value[0];
  }
}

async function loadWorldbookEntries(): Promise<void> {
  if (!selectedWorldbookName.value) {
    worldbookEntries.value = [];
    return;
  }

  isWorldbookLoading.value = true;
  worldbookError.value = '';

  try {
    worldbookEntries.value = await getWorldbook(selectedWorldbookName.value);
  } catch (error) {
    worldbookError.value = '读取世界书失败，请检查绑定状态。';
    console.error(error);
  } finally {
    isWorldbookLoading.value = false;
  }
}

async function reloadWorldbook(): Promise<void> {
  await loadWorldbookNames();
  await loadWorldbookEntries();
}

async function toggleWorldbookEntryState(uid: number, enabled: boolean): Promise<void> {
  if (!selectedWorldbookName.value) return;

  try {
    worldbookEntries.value = await updateWorldbookWith(selectedWorldbookName.value, entries => {
      return entries.map(entry => {
        if (entry.uid !== uid) return entry;
        return { ...entry, enabled };
      });
    });
  } catch (error) {
    toastr.error('世界书条目状态更新失败。');
    console.error(error);
  }
}

function refreshChatVariablesSnapshot(): void {
  try {
    chatVariablesSnapshot.value = getVariables({ type: 'chat' });
  } catch {
    chatVariablesSnapshot.value = {};
  }
}

function updateOptionsFromMessage(message: string): void {
  const dynamic = extractRoleplayOptions(message);
  if (dynamic.length > 0) {
    options.value = dynamic;
  }
}

function refreshLatestAssistantMessage(): void {
  const lastId = syncLastMessageId();
  const start = Math.max(0, lastId - 80);
  const range = `${start}-${lastId}`;
  const list = getChatMessages(range, { role: 'assistant', hide_state: 'unhidden' }) as ChatMessage[];
  const latest = list.at(-1);

  if (!latest || typeof latest.message !== 'string') return;
  rawCurrentMessage.value = latest.message;
  updateOptionsFromMessage(latest.message);
}

function scrollStoryIfNeeded(): void {
  if (!settings.value.autoScroll) return;
  const target = document.getElementById('story-current-message');
  target?.scrollIntoView({ behavior: settings.value.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
}

async function handleOption(content: string): Promise<void> {
  const clean = content.trim();
  if (!clean) {
    toastr.info('选项内容为空，无法发送。');
    return;
  }

  if (showPerspectiveSelector.value || !perspectiveConfirmed.value) {
    toastr.warning('请先完成主视角选择。');
    return;
  }

  if (isBusyGenerating.value) return;
  isBusyGenerating.value = true;

  try {
    const isFirstTurn = syncLastMessageId() === 0;
    await createChatMessages([{ role: 'user', message: clean }]);

    const result = await generate({
      user_input: clean,
      should_stream: false,
      overrides: isFirstTurn
        ? {
            chat_history: {
              prompts: [{ role: 'assistant', content: getPerspectiveOpening() }],
            },
          }
        : undefined,
    });

    const latest = getChatMessages(-1)[0] as ChatMessage | undefined;
    if (!latest || latest.role !== 'assistant') {
      await createChatMessages([{ role: 'assistant', message: result }]);
    }

    rawCurrentMessage.value = result;
    refreshLatestAssistantMessage();
    updateOptionsFromMessage(result);
    syncLastMessageId();
    loadHistory(false);
    refreshChatVariablesSnapshot();
    scrollStoryIfNeeded();
  } catch (error) {
    toastr.error('发送选项或生成回复失败。');
    console.error(error);
  } finally {
    isBusyGenerating.value = false;
  }
}

async function submitCustomOption(): Promise<void> {
  const value = customOption.value.trim();
  if (!value) {
    toastr.info('请先填写自定义选项内容。');
    return;
  }

  options.value.unshift({
    id: `opt-custom-${Date.now()}`,
    title: '自定义行动',
    content: value,
  });
  customOption.value = '';
  await handleOption(value);
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      isFullscreen.value = true;
      return;
    }

    await document.exitFullscreen();
    isFullscreen.value = false;
  } catch (error) {
    toastr.warning('当前环境不支持全屏切换。');
    console.warn(error);
  }
}

function handleStart(): void {
  isSplashScreenVisible.value = false;
}

function focusCurrentModalFirstItem(): void {
  nextTick(() => {
    if (showPerspectiveSelector.value) {
      const selector =
        document.getElementById('btn-select-perspective-心爱') ?? document.getElementById('btn-confirm-perspective');
      selector?.focus();
      return;
    }

    if (isFeatureModalVisible.value) {
      const target =
        document.getElementById(`modal-tab-${activeTab.value}`) ?? document.getElementById('btn-close-feature-modal');
      target?.focus();
    }
  });
}

function openFeatureModal(tab: FeatureTabKey): void {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  activeTab.value = tab;
  isFeatureModalVisible.value = true;
  focusCurrentModalFirstItem();
}

function closeFeatureModal(): void {
  isFeatureModalVisible.value = false;
  nextTick(() => {
    lastFocusedElement?.focus();
  });
}

function openCharacterDetail(characterKey: string): void {
  activeCharacterKey.value = characterKey;
  openFeatureModal('character');
}

function trapFocusInModal(event: KeyboardEvent, modalId: string): void {
  if (event.key !== 'Tab') return;

  const modal = document.getElementById(modalId);
  if (!modal) return;

  const selectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusable = [...modal.querySelectorAll<HTMLElement>(selectors)].filter(item => !item.hasAttribute('disabled'));
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  if (showPerspectiveSelector.value) return;
  if (isFeatureModalVisible.value) {
    closeFeatureModal();
  }
}

async function initializeForCurrentChat(): Promise<void> {
  syncLastMessageId();
  const cachedPerspective = readPerspectiveFromChatVariables();
  showPerspectiveSelector.value = shouldShowPerspectiveModal() && !cachedPerspective;
  selectedPerspective.value = showPerspectiveSelector.value ? cachedPerspective : (cachedPerspective ?? '无');
  perspectiveConfirmed.value = !showPerspectiveSelector.value;

  if (!showPerspectiveSelector.value && selectedPerspective.value) {
    activeCharacterKey.value = perspectiveToCharacter[selectedPerspective.value];
  }

  refreshLatestAssistantMessage();
  loadHistory(true);
  refreshChatVariablesSnapshot();
  await reloadWorldbook();

  if (showPerspectiveSelector.value) {
    focusCurrentModalFirstItem();
  }
}

watch(
  () => settings.value,
  () => {
    saveSettings();
  },
  { deep: true },
);

watch(
  () => [rawCurrentMessage.value, settings.value.displayMode, settings.value.reduceMotion],
  () => {
    applyDisplayMessage(rawCurrentMessage.value);
  },
  { immediate: true },
);

watch(activeTab, tab => {
  if (tab === 'history') {
    loadHistory(false);
    return;
  }

  if (tab === 'worldbook') {
    void reloadWorldbook();
    return;
  }

  if (tab === 'character') {
    refreshChatVariablesSnapshot();
  }
});

watch(selectedWorldbookName, () => {
  void loadWorldbookEntries();
});

onMounted(() => {
  document.title = '点兔文字交互界面';
  upsertMetaDescription('高沉浸文字互动体验，支持选项驱动叙事、世界书联动与主视角开场注入。');
  document.addEventListener('keydown', onGlobalKeydown);

  void initializeForCurrentChat();

  eventStops.push(
    eventOn(tavern_events.MESSAGE_RECEIVED, () => {
      syncLastMessageId();
      refreshLatestAssistantMessage();
      loadHistory(false);
      refreshChatVariablesSnapshot();
    }).stop,
  );

  eventStops.push(
    eventOn(tavern_events.MESSAGE_EDITED, () => {
      syncLastMessageId();
      refreshLatestAssistantMessage();
      loadHistory(false);
    }).stop,
  );

  eventStops.push(
    eventOn(tavern_events.MESSAGE_SWIPED, () => {
      syncLastMessageId();
      refreshLatestAssistantMessage();
    }).stop,
  );

  eventStops.push(
    eventOn(tavern_events.CHAT_CHANGED, () => {
      void initializeForCurrentChat();
      toastr.info('检测到聊天切换，界面数据已自动同步。');
    }).stop,
  );

  eventStops.push(
    eventOn(tavern_events.WORLDINFO_UPDATED, () => {
      void reloadWorldbook();
    }).stop,
  );
});

onBeforeUnmount(() => {
  clearTypewriterTimer();
  document.removeEventListener('keydown', onGlobalKeydown);
  eventStops.forEach(stop => stop());
});
</script>
