<template>
  <div
    id="page-game-root"
    :data-theme="settings.theme"
    data-font="font-ui-default"
    :data-reduced-motion="settings.reduceMotion ? 'true' : 'false'"
    :style="pageRootStyle"
  >
    <!-- Background Layer -->
    <div class="background-layer">
      <div class="bg-pattern"></div>
    </div>

    <!-- Splash Screen -->
    <transition name="fade">
      <section v-if="isSplashScreenVisible" class="splash-screen">
        <div class="splash-logo animate-fadeInDown">
          <h1 class="splash-title">ご注文はうさぎですか？</h1>
          <p class="splash-subtitle">BLOOM SIMULATOR</p>
        </div>
        <button class="press-start-btn animate-fadeInUp" @click="handleStart">
          <span class="animate-pulse">PRESS START</span>
        </button>
      </section>
    </transition>

    <!-- Top Navigation -->
    <header id="region-top-nav">
      <div class="brand-logo">
        <span class="brand-main">点兔叙事界面</span>
        <span class="brand-sub">Gochiusa Narrative Interface</span>
      </div>

      <div class="nav-actions">
        <button class="nav-btn" title="历史消息" @click="openFeatureModal('history')">
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>历史</span>
        </button>
        <button class="nav-btn" title="世界书" @click="openFeatureModal('worldbook')">
          <i class="fa-solid fa-book-open"></i>
          <span>世界书</span>
        </button>
        <button class="nav-btn" title="设置" @click="openFeatureModal('settings')">
          <i class="fa-solid fa-gear"></i>
          <span>设置</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main id="region-main-content">
      <!-- Story Panel -->
      <section class="panel-story">
        <div class="panel-header">
          <h2>叙事消息</h2>
          <div class="header-tools">
            <button class="btn nav-btn" @click="refreshLatestAssistantMessage">
              <i class="fa-solid fa-arrows-rotate"></i>
              <span>同步</span>
            </button>
          </div>
        </div>
        <article id="story-current-message" aria-live="polite">
          {{ displayedMessage }}
        </article>
      </section>

      <!-- Options Panel -->
      <section class="panel-options">
        <div class="panel-header">
          <h2>可选行动</h2>
          <span v-if="isBusyGenerating" class="status-chip animate-pulse">正在生成回复...</span>
        </div>

        <ul class="option-list">
          <li v-for="(option, index) in options" :key="option.id">
            <button class="option-card" :disabled="isBusyGenerating" @click="handleOption(option.content)">
              <strong>Option {{ index + 1 }}</strong>
              <span>{{ option.content }}</span>
            </button>
          </li>
        </ul>

        <div class="custom-input-group">
          <textarea
            v-model="customOption"
            placeholder="输入自定义行动..."
            :disabled="isBusyGenerating"
            @keydown.enter.prevent="submitCustomOption"
          ></textarea>
          <button class="btn-send" :disabled="isBusyGenerating" @click="submitCustomOption">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </section>
    </main>

    <!-- Bottom Character Bar -->
    <footer id="region-character-bar">
      <div class="character-scroll">
        <div
          v-for="item in characterProfiles"
          :key="item.key"
          class="char-chip"
          :style="{ '--chip-color': item.color }"
          @click="openCharacterDetail(item.key)"
        >
          <div class="char-avatar">
            <img :src="item.avatarUrl" :alt="item.name" @error="onAvatarImageError($event, item.name)" />
          </div>
          <span class="char-name">{{ item.name }}</span>
        </div>
      </div>

      <div class="quick-actions-mini">
        <button class="mini-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
          <i class="fa-solid" :class="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
        </button>
        <button
          class="mini-btn"
          :title="settings.autoScroll ? '关闭自动滚动' : '开启自动滚动'"
          @click="settings.autoScroll = !settings.autoScroll"
        >
          <i class="fa-solid" :class="settings.autoScroll ? 'fa-angles-down' : 'fa-minus'"></i>
        </button>
        <button class="mini-btn" title="切换显示模式" @click="toggleDisplayMode">
          <i class="fa-solid fa-font"></i>
        </button>
      </div>
    </footer>

    <!-- Modals -->
    <transition name="fade">
      <div v-if="isFeatureModalVisible" class="modal-scrim" @click.self="closeFeatureModal">
        <div class="modal-shell">
          <header class="modal-header">
            <h2>{{ modalTitle }}</h2>
            <button class="nav-btn" @click="closeFeatureModal"><i class="fa-solid fa-xmark"></i></button>
          </header>

          <nav
            class="tab-nav"
            style="display: flex; padding: 10px; gap: 10px; border-bottom: 1px solid var(--line-soft)"
          >
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="btn"
              :class="{ active: activeTab === tab.key }"
              style="
                flex: 1;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid var(--line-soft);
                background: none;
                cursor: pointer;
              "
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </nav>

          <div class="modal-body">
            <!-- History Tab -->
            <div v-if="activeTab === 'history'" class="tab-panel">
              <div class="panel-tools" style="display: flex; gap: 10px; margin-bottom: 15px">
                <input
                  v-model.trim="historyQuery"
                  type="search"
                  placeholder="搜索历史消息..."
                  style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--line-soft)"
                />
                <button class="btn" @click="loadHistory(true)">刷新</button>
              </div>
              <div class="history-list" style="display: flex; flex-direction: column; gap: 10px">
                <div
                  v-for="msg in historyFilteredMessages"
                  :key="msg.message_id"
                  class="card"
                  style="padding: 15px; border: 1px solid var(--line-soft); border-radius: 12px; background: white"
                >
                  <div
                    style="
                      display: flex;
                      justify-content: space-between;
                      margin-bottom: 8px;
                      font-size: 0.85rem;
                      color: var(--ink-1);
                    "
                  >
                    <span>#{{ msg.message_id }} {{ msg.name || roleLabel(msg.role) }}</span>
                  </div>
                  <p style="font-size: 0.95rem; margin-bottom: 10px">{{ truncateText(msg.message, 200) }}</p>
                  <button
                    class="btn"
                    style="font-size: 0.8rem; padding: 4px 10px"
                    @click="useHistoryAsCustom(msg.message)"
                  >
                    引用
                  </button>
                </div>
                <button v-if="historyHasMore" class="btn" @click="loadMoreHistory">加载更多</button>
              </div>
            </div>

            <!-- Worldbook Tab -->
            <div v-else-if="activeTab === 'worldbook'" class="tab-panel">
              <div class="panel-tools" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px">
                <select
                  v-model="selectedWorldbookName"
                  style="padding: 8px; border-radius: 8px; border: 1px solid var(--line-soft)"
                >
                  <option v-for="name in worldbookNames" :key="name" :value="name">{{ name }}</option>
                </select>
                <input
                  v-model.trim="worldbookQuery"
                  type="search"
                  placeholder="搜索条目..."
                  style="padding: 8px; border-radius: 8px; border: 1px solid var(--line-soft)"
                />
              </div>
              <div class="worldbook-list" style="display: flex; flex-direction: column; gap: 10px">
                <div
                  v-for="entry in filteredWorldbookEntries"
                  :key="entry.uid"
                  class="card"
                  style="padding: 15px; border: 1px solid var(--line-soft); border-radius: 12px; background: white"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
                    <strong style="color: var(--accent-gold)">{{ entry.name }}</strong>
                    <button
                      class="btn"
                      :style="{ color: entry.enabled ? 'green' : 'red' }"
                      @click="toggleWorldbookEntryState(entry.uid, !entry.enabled)"
                    >
                      {{ entry.enabled ? '已启用' : '已禁用' }}
                    </button>
                  </div>
                  <p style="font-size: 0.9rem; color: var(--ink-1)">{{ truncateText(entry.content, 150) }}</p>
                </div>
              </div>
            </div>

            <!-- Settings Tab -->
            <div v-else-if="activeTab === 'settings'" class="tab-panel">
              <div class="settings-grid" style="display: flex; flex-direction: column; gap: 20px">
                <div class="setting-item">
                  <label style="display: block; margin-bottom: 8px; font-weight: 600">主题风格</label>
                  <div style="display: flex; gap: 10px">
                    <button
                      class="btn"
                      :class="{ active: settings.theme === 'theme-latte-noir' }"
                      @click="settings.theme = 'theme-latte-noir'"
                    >
                      奶油白昼
                    </button>
                    <button
                      class="btn"
                      :class="{ active: settings.theme === 'theme-midnight-salon' }"
                      @click="settings.theme = 'theme-midnight-salon'"
                    >
                      午夜沙龙
                    </button>
                  </div>
                </div>
                <div class="setting-item">
                  <label style="display: block; margin-bottom: 8px; font-weight: 600">显示模式</label>
                  <div style="display: flex; gap: 10px">
                    <button
                      class="btn"
                      :class="{ active: settings.displayMode === 'instant' }"
                      @click="settings.displayMode = 'instant'"
                    >
                      即时
                    </button>
                    <button
                      class="btn"
                      :class="{ active: settings.displayMode === 'typewriter' }"
                      @click="settings.displayMode = 'typewriter'"
                    >
                      打字机
                    </button>
                    <button
                      class="btn"
                      :class="{ active: settings.displayMode === 'segment' }"
                      @click="settings.displayMode = 'segment'"
                    >
                      分段
                    </button>
                  </div>
                </div>
                <div class="setting-item">
                  <label style="display: block; margin-bottom: 8px; font-weight: 600">字体大小</label>
                  <div style="display: flex; gap: 10px">
                    <button
                      class="btn"
                      :class="{ active: settings.fontScale === 'small' }"
                      @click="settings.fontScale = 'small'"
                    >
                      小
                    </button>
                    <button
                      class="btn"
                      :class="{ active: settings.fontScale === 'medium' }"
                      @click="settings.fontScale = 'medium'"
                    >
                      中
                    </button>
                    <button
                      class="btn"
                      :class="{ active: settings.fontScale === 'large' }"
                      @click="settings.fontScale = 'large'"
                    >
                      大
                    </button>
                  </div>
                </div>
                <button
                  class="btn"
                  style="margin-top: 20px; background: #ff4d4f; color: white; border: none"
                  @click="resetSettings"
                >
                  重置所有设置
                </button>
              </div>
            </div>

            <!-- Character Tab -->
            <div v-else-if="activeTab === 'character'" class="tab-panel">
              <div style="display: flex; gap: 20px; flex-direction: column">
                <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px">
                  <button
                    v-for="item in characterProfiles"
                    :key="item.key"
                    class="btn"
                    :class="{ active: activeCharacterKey === item.key }"
                    @click="activeCharacterKey = item.key"
                  >
                    {{ item.name }}
                  </button>
                </div>
                <div
                  class="card"
                  style="padding: 20px; border: 1px solid var(--line-soft); border-radius: 16px; background: white"
                >
                  <div style="display: flex; gap: 20px; align-items: flex-start">
                    <img
                      :src="activeCharacter.avatarUrl"
                      style="
                        width: 100px;
                        height: 100px;
                        border-radius: 12px;
                        object-fit: cover;
                        border: 2px solid var(--accent-gold);
                      "
                    />
                    <div>
                      <h3 style="margin-bottom: 5px; color: var(--accent-gold)">{{ activeCharacter.name }}</h3>
                      <p style="font-size: 0.9rem; color: var(--ink-1)">{{ activeCharacter.summary }}</p>
                    </div>
                  </div>
                  <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px">
                    <div v-for="(val, label) in activeCharacterState" :key="label">
                      <span style="display: block; font-size: 0.8rem; color: var(--ink-muted)">{{ label }}</span>
                      <span style="font-weight: 600">{{ val }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Perspective Selector -->
    <transition name="fade">
      <div v-if="showPerspectiveSelector" class="modal-scrim">
        <div class="modal-shell" style="max-width: 800px">
          <header class="modal-header">
            <h2>请选择主视角</h2>
          </header>
          <div class="modal-body">
            <p style="margin-bottom: 20px; color: var(--ink-1)">
              首次进入当前聊天，请选择一个主视角以注入对应的开场白。
            </p>
            <div
              style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
              "
            >
              <button
                v-for="item in perspectiveEntries"
                :key="item.key"
                class="card"
                :style="{
                  border:
                    selectedPerspective === item.key ? '2px solid var(--accent-gold)' : '1px solid var(--line-soft)',
                  padding: '15px',
                  cursor: 'pointer',
                  background: 'white',
                  textAlign: 'left',
                }"
                @click="selectedPerspective = item.key"
              >
                <strong style="display: block; margin-bottom: 5px; color: var(--accent-gold)">{{ item.key }}</strong>
                <span style="font-size: 0.85rem; color: var(--ink-1)">{{ item.description }}</span>
              </button>
            </div>
            <div
              v-if="selectedPerspective"
              class="card"
              style="padding: 20px; background: var(--bg-1); border-radius: 12px; margin-bottom: 20px"
            >
              <h3 style="font-size: 0.9rem; margin-bottom: 10px; color: var(--ink-1)">开场白预览：</h3>
              <p style="font-family: 'Noto Serif SC', serif; line-height: 1.6">{{ selectedOpeningPreview }}</p>
            </div>
            <button
              class="btn-send"
              style="width: 100%; padding: 15px; font-size: 1.1rem"
              :disabled="!selectedPerspective"
              @click="confirmPerspective"
            >
              确认并开始故事
            </button>
          </div>
        </div>
      </div>
    </transition>
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

const tabs: { key: FeatureTabKey; label: string }[] = [
  { key: 'history', label: '历史消息' },
  { key: 'worldbook', label: '世界书' },
  { key: 'settings', label: '设置' },
  { key: 'character', label: '角色详情' },
];

const modalTitle = computed(() => {
  return tabs.find(t => t.key === activeTab.value)?.label || '功能面板';
});

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
    当前心情: String(mood),
    所在位置: String(location),
    当前着装: String(outfit),
    关系状态: String(relation),
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

function openFeatureModal(tab: FeatureTabKey): void {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  activeTab.value = tab;
  isFeatureModalVisible.value = true;
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
