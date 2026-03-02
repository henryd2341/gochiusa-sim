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
      <!-- Floating Accents -->
      <!-- <svg class="floating-accent" style="top: 15%; left: 5%; width: 120px;" viewBox="0 0 100 100">
        <path fill="currentColor" d="M50 10 A40 40 0 0 1 90 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10 Z" fill-opacity="0.1" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="0.5" fill="none" stroke-dasharray="2 4" />
      </svg>
      <svg class="floating-accent" style="bottom: 10%; right: 5%; width: 150px; animation-delay: -2s;" viewBox="0 0 100 100">
        <path fill="currentColor" d="M20 50 Q50 20 80 50 T20 50" fill-opacity="0.05" />
      </svg> -->
    </div>

    <!-- Splash Screen -->
    <transition name="fade">
      <section v-if="isSplashScreenVisible" class="splash-screen">
        <!-- Corner Decors -->
        <div
          v-for="pos in ['top-left', 'top-right', 'bottom-left', 'bottom-right']"
          :key="pos"
          :class="['splash-decor', pos]"
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <defs>
              <radialGradient id="grad-decor" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="currentColor" stop-opacity="0.8" />
                <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx="0"
              cy="0"
              r="160"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-dasharray="10 20"
              opacity="0.4"
            />
            <path d="M0 180 Q 80 180 180 0" fill="none" stroke="currentColor" stroke-width="2" />
            <circle cx="40" cy="140" r="15" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="M10 100 L30 120 M40 80 L60 100" stroke="currentColor" stroke-width="1" />
          </svg>
        </div>

        <div class="splash-logo animate-fadeInDown">
          <img :src="titleBrownLogo" />
        </div>
        <button class="press-start-btn animate-fadeInUp" @click="handleStart">
          <span class="animate-pulse">PRESS START</span>
        </button>

        <!-- Version Info -->
        <div class="version-info animate-fadeInUp">
          <span>Version 1.0.1</span>
        </div>
      </section>
    </transition>

    <!-- Top Navigation -->
    <header id="region-top-nav">
      <div class="brand-logo">
        <span class="brand-main">叙事界面</span>
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
            <button class="btn nav-btn" @click="handleSwipe">
              <i class="fa-solid fa-shuffle"></i>
              <span>重新生成</span>
            </button>
            <button class="btn nav-btn" @click="openEditLastMessage">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>编辑</span>
            </button>
          </div>
        </div>
        <article
          v-show="!isEditingMessageVisible"
          id="story-current-message"
          aria-live="polite"
          v-html="displayedMessage"
        ></article>
        <div v-if="isEditingMessageVisible" id="edit-last-message" class="edit-last-message">
          <label for="edit-last-message-textarea" class="sr-only">编辑上一条消息</label>
          <textarea
            id="edit-last-message-textarea"
            v-model="editingMessageText"
            class="edit-textarea"
            placeholder="在此编辑上一条消息内容..."
          ></textarea>
          <div class="edit-actions">
            <button class="btn nav-btn" :disabled="!editingMessageText.trim()" @click="saveEditedMessage">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>保存编辑</span>
            </button>
            <button class="btn nav-btn" @click="cancelEdit">
              <i class="fa-solid fa-xmark"></i>
              <span>取消编辑</span>
            </button>
          </div>
        </div>
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
                  style="
                    padding: 15px;
                    border: 1px solid var(--line-soft);
                    border-radius: 12px;
                    background: var(--card-bg);
                  "
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
                  style="
                    padding: 15px;
                    border: 1px solid var(--line-soft);
                    border-radius: 12px;
                    background: var(--card-bg);
                  "
                >
                  <div
                    style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px"
                  >
                    <div>
                      <strong style="display: block; color: var(--accent-gold); font-size: 1.1rem">{{
                        entry.name
                      }}</strong>
                      <div style="display: flex; gap: 8px; margin-top: 4px">
                        <span
                          v-if="entry.strategy.type === 'constant'"
                          class="status-chip"
                          style="background: #eef; color: #55a; font-size: 0.7rem"
                          >常驻</span
                        >
                        <span
                          v-if="entry.strategy.type === 'selective'"
                          class="status-chip"
                          style="background: #efe; color: #5a5; font-size: 0.7rem"
                          >条件触发</span
                        >
                        <span
                          v-if="entry.strategy.type === 'vectorized'"
                          class="status-chip"
                          style="background: #eee; color: #666; font-size: 0.7rem"
                          >向量化</span
                        >
                      </div>
                    </div>
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        :checked="entry.enabled"
                        @change="toggleWorldbookEntryState(entry.uid, !entry.enabled)"
                      />
                      <span class="slider"></span>
                    </label>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--ink-1); line-height: 1.5; margin-bottom: 10px">
                    {{ truncateText(entry.content, 100) }}
                  </p>
                  <button class="btn" style="width: 100%; font-size: 0.8rem" @click="viewWorldbookDetail(entry)">
                    查看完整条目内容
                  </button>
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
                  style="
                    padding: 20px;
                    border: 1px solid var(--line-soft);
                    border-radius: 16px;
                    background: var(--card-bg);
                  "
                >
                  <div style="display: flex; gap: 20px; align-items: flex-start">
                    <img
                      :src="activeCharacter.avatarUrl"
                      style="
                        width: 100px;
                        height: 100px;
                        border-radius: 12px;
                        object-fit: cover;
                        flex-shrink: 0;
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

    <!-- Worldbook Detail Modal -->
    <transition name="fade">
      <div v-if="selectedEntry" class="modal-scrim" @click="selectedEntry = null">
        <div class="modal-shell" style="max-width: 700px" @click.stop>
          <header class="modal-header">
            <h2>{{ selectedEntry.name }}</h2>
            <button class="nav-btn" @click="selectedEntry = null"><i class="fa-solid fa-xmark"></i></button>
          </header>
          <div class="modal-body">
            <div style="white-space: pre-wrap; line-height: 1.6; font-family: 'Noto Sans SC', sans-serif">
              {{ selectedEntry.content }}
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div
      v-if="!isSplashScreenVisible"
      class="floating-panel floating-panel-shop"
      :class="{ minimized: isWorldMinimized && isShopPopularityMinimized }"
      :style="{ transform: `translate(${shopPopularityPosition.x}px, ${shopPopularityPosition.y}px)` }"
      @mousedown.stop="onShopPopularityDragStart"
      @touchstart.stop.prevent="onShopPopularityDragStart"
    >
      <!-- 世界部分 -->
      <header class="floating-panel-header" :class="{ 'section-header': true }">
        <div class="floating-panel-title">
          <i class="fa-solid fa-globe"></i>
          <span>世界</span>
        </div>
        <button class="mini-btn" type="button" @click.stop="toggleWorldMinimized">
          <i class="fa-solid" :class="isWorldMinimized ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
      </header>
      <transition name="slide-up">
        <div v-if="!isWorldMinimized" class="floating-panel-body world-section-body">
          <div class="world-info-row">
            <span class="world-label">时间</span>
            <span class="world-value">{{ worldInfo.time }}</span>
          </div>
          <div class="world-info-row">
            <span class="world-label">地点</span>
            <span class="world-value">{{ worldInfo.location }}</span>
          </div>
          <div class="world-info-row">
            <span class="world-label">季节</span>
            <span class="world-value">{{ worldInfo.season }}</span>
          </div>
          <div class="world-info-row">
            <span class="world-label">天气</span>
            <span class="world-value">{{ worldInfo.weather }}</span>
          </div>
          <div v-if="worldInfo.recentEvents.length > 0" class="world-info-row world-events-row">
            <span class="world-label">近期事务</span>
            <div class="world-events-list">
              <div v-for="(event, index) in worldInfo.recentEvents" :key="index" class="world-event-item">
                <span class="event-name">{{ event.name }}</span>
                <span class="event-desc">{{ event.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 分隔线 -->
      <div v-if="!isWorldMinimized || !isShopPopularityMinimized" class="floating-panel-divider"></div>

      <!-- 店铺人气部分 -->
      <header class="floating-panel-header" :class="{ 'section-header': true }">
        <div class="floating-panel-title">
          <i class="fa-solid fa-mug-saucer"></i>
          <span>店铺人气</span>
        </div>
        <button class="mini-btn" type="button" @click.stop="toggleShopPopularityMinimized">
          <i class="fa-solid" :class="isShopPopularityMinimized ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
      </header>
      <transition name="slide-up">
        <div v-if="!isShopPopularityMinimized" class="floating-panel-body">
          <div class="shop-popularity-row">
            <span class="shop-name">Rabbit House</span>
            <div class="shop-meter">
              <div class="shop-meter-fill shop-meter-rabbit" :style="{ width: shopPopularity.rabbitHouse + '%' }"></div>
            </div>
            <span class="shop-value">{{ shopPopularity.rabbitHouse }}%</span>
          </div>
          <div class="shop-popularity-row">
            <span class="shop-name">甘兔庵</span>
            <div class="shop-meter">
              <div class="shop-meter-fill shop-meter-chiya" :style="{ width: shopPopularity.甘兔庵 + '%' }"></div>
            </div>
            <span class="shop-value">{{ shopPopularity.甘兔庵 }}%</span>
          </div>
          <div class="shop-popularity-row">
            <span class="shop-name">Fleur de Lapin</span>
            <div class="shop-meter">
              <div class="shop-meter-fill shop-meter-syaro" :style="{ width: shopPopularity.fleur + '%' }"></div>
            </div>
            <span class="shop-value">{{ shopPopularity.fleur }}%</span>
          </div>
          <div class="shop-popularity-row">
            <span class="shop-name">Bright Bunny</span>
            <div class="shop-meter">
              <div class="shop-meter-fill shop-meter-fuyu" :style="{ width: shopPopularity.brightBunny + '%' }"></div>
            </div>
            <span class="shop-value">{{ shopPopularity.brightBunny }}%</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineMvuDataStore } from '@util/mvu';
import { Dictionary } from 'lodash';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Schema } from '../schema';
import titleBrownLogo from './assets/icons/title_brown.svg?url';

let useDataStore = defineMvuDataStore(Schema, { type: 'message', message_id: getCurrentMessageId() });
let store = useDataStore();
const editingMessageText = ref('');
const lastMessageRaw = ref<ChatMessage | null>(null);

type FeatureTabKey = 'history' | 'worldbook' | 'settings' | 'character';
type DisplayMode = 'instant' | 'typewriter' | 'segment';
type ThemeMode = 'theme-latte-noir' | 'theme-midnight-salon';
type FontScale = 'small' | 'medium' | 'large';

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
  keyItems: Dictionary<{ 描述: string; 数量: number }>;
};

const defaultSettings: UISettings = {
  theme: 'theme-latte-noir',
  displayMode: 'instant',
  fontScale: 'medium',
  autoScroll: true,
  reduceMotion: false,
};

const SETTINGS_STORAGE_KEY = 'gochiusa.frontend.settings.v2';

function catboxImage(code: string): string {
  return `https://files.catbox.moe/${code}.png`;
}

// 角色静态信息（不随数据变化）
const characterStaticInfo = [
  {
    key: 'cocoa',
    name: '保登心爱',
    color: 'var(--clr-cocoa)',
    avatarCode: 'qjltca',
    summary: 'Rabbit House寄宿店员。喜欢毛茸茸的东西。把智乃视为妹妹一样的存在。名字源自于热可可（Hot Cocoa）。',
  },
  {
    key: 'chino',
    name: '香风智乃',
    color: 'var(--clr-chino)',
    avatarCode: '6t09pw',
    summary:
      'Rabbit House家的独生女。性格冷淡的无口系少女，独立能力强但不擅长与人相处。在咖啡方面有着渊博的知识。名字源自于卡布奇诺。',
  },
  {
    key: 'rize',
    name: '天天座理世',
    color: 'var(--clr-rize)',
    avatarCode: 'n9szhx',
    summary:
      '在Rabbit House打工的店员。平时是个会携带武器的、浑身散发着军人气质的强力角色，内心里却也有着少女的一面。名字源自于法国熏香加味绿茶夏日香气（Thé Des Alizés）。',
  },
  {
    key: 'chiya',
    name: '宇治松千夜',
    color: 'var(--clr-chiya)',
    avatarCode: 'v4spnt',
    summary:
      '和风甜品店甘兔庵的看板娘。有着大和抚子的相貌和气质。兴趣是为菜品起各种各样古怪的名字。名字源自于宇治抹茶。',
  },
  {
    key: 'syaro',
    name: '桐间纱路',
    color: 'var(--clr-syaro)',
    avatarCode: 'b982xz',
    summary:
      '在Fleur du Lapin打工的店员，千夜的发小。有着贵族大小姐一般的气质，却过着简朴的生活。也有着害怕兔子以及容易醉咖啡的一面。名字源自于乞力马扎罗咖啡（Kilimanjaro）。',
  },
  {
    key: 'maya',
    name: '条河麻耶',
    color: 'var(--clr-maya)',
    avatarCode: 'bmw44n',
    summary: '活泼元气，个性爽朗，大大咧咧的高一新生，善于带动团队气氛。名字源自于产自玉玛雅的大吉岭红茶。',
  },
  {
    key: 'megu',
    name: '奈津惠',
    color: 'var(--clr-megu)',
    avatarCode: 'koovsy',
    summary: '个性温和，有点天然呆的高一新生，情绪变化细腻。名字源自于肉豆蔻（Nutmeg）。',
  },
  {
    key: 'fuyu',
    name: '风衣叶冬优',
    color: 'var(--clr-fuyu)',
    avatarCode: 'lckv74',
    summary:
      '寄宿在Bright Bunny的高一新生，升入高中以前在大都市生活，与城市中的猫咪们作伴。擅长国际象棋和腹语术。名字源自于短舌匹菊（Feverfew）。',
  },
  {
    key: 'natsume',
    name: '神沙夏明',
    color: 'var(--clr-natsume)',
    avatarCode: 'usclrp',
    summary: 'Bright Bunny社长家的千金，是双胞胎中的妹妹，性格傲娇。名字源自于红枣姜茶。',
  },
  {
    key: 'eru',
    name: '神沙映月',
    color: 'var(--clr-eru)',
    avatarCode: 'r10sh1',
    summary: 'Bright Bunny社长家的千金，是双胞胎中的姐姐，性格比较天然呆和脱线。名字源自于姜汁汽水（Ginger Ale）。',
  },
  {
    key: 'yura',
    name: '狩手结良',
    color: 'var(--clr-yura)',
    avatarCode: 'a3uv0i',
    summary:
      '理世在高中和大学时的同学，高中时担任吹箭部长，上大学后在理世家兼职女仆。由于两人父亲之间的关系，也是理世的发小。名字源自于金盏花茶（Calendula）。',
  },
  {
    key: 'aoyama',
    name: '青山蓝山',
    color: 'var(--clr-aoyama)',
    avatarCode: 'x18i00',
    summary: '散发着宁和气质的小说家。学生时代时曾在小说创作方面得到智乃的爷爷的关照和建议。名字源自于蓝山咖啡。',
  },
  {
    key: 'mate',
    name: '真手凛',
    color: 'var(--clr-mate)',
    avatarCode: 'kk59ir',
    summary:
      '青山小姐的责任编辑，也是青山小姐高中时期的后辈，自学生时代起就会为了敦促四处游走的青山小姐好好工作而到处寻找她。名字源自于曼特宁咖啡。',
  },
  {
    key: 'mocha',
    name: '保登摩卡',
    color: 'var(--clr-mocha)',
    avatarCode: 'hi872c',
    summary:
      '心爱的姐姐，也是家中的大姐，是兄弟姐妹中年龄最小的心爱所依靠和憧憬的对象。平时散发着可靠的姐姐气场，但也有着天然的一面。在老家的保登面包房中工作，擅长做松松软软的面包。名字源自于摩卡咖啡。',
  },
] as const;

// 动态角色资料（计算属性，响应 store 数据变化）
const characterProfiles = computed<CharacterProfile[]>(() => {
  const data = store.data;
  return characterStaticInfo.map(info => ({
    key: info.key,
    name: info.name,
    color: info.color,
    avatarUrl: catboxImage(info.avatarCode),
    summary: info.summary,
    mood: data[info.name]?.心情状态 ?? '',
    location: data[info.name]?.当前位置 ?? '',
    outfit: data[info.name]?.着装 ?? '',
    keyItems: data[info.name]?.关键物品 ?? {},
  }));
});

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
  const block = message.match(/<OPTIONS>([\s\S]*?)<\/OPTIONS>/i)?.[1] ?? '';
  if (!block.trim()) return [];

  return [...block.matchAll(/(.+?)[:：]\s*(.+)/g)].map((match, index) => ({
    id: `opt-dynamic-${index + 1}`,
    title: match[1].trim(),
    content: match[2].trim(),
  }));
}

const settings = ref<UISettings>(loadSettings());

const isFeatureModalVisible = ref(false);
const activeTab = ref<FeatureTabKey>('history');
const isSplashScreenVisible = ref(true);
const customOption = ref('');
const isFullscreen = ref(false);
const isBusyGenerating = ref(false);
const selectedEntry = ref<WorldbookEntry | null>(null);

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

const isEditingMessageVisible = ref(false);

const isWorldMinimized = ref(true);
const isShopPopularityMinimized = ref(true);
const shopPopularityPosition = ref({ x: 24, y: 96 });
const isDraggingShopPopularity = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

const options = ref<RoleplayOption[]>([{ id: 'opt-001', title: '看到我', content: '说明选项没出或者格式掉了。。' }]);

// Parsed Content
const extractedContext = ref('');
const extractedVariables = ref('');

/**
 * HTML 转义函数 - 防止 XSS 攻击
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 简单的类 Markdown 渲染器（安全的 XSS 防护版本）
 * 支持：**强调**、*斜体*、中英文引号
 * 流程：先转义 HTML → 再应用 Markdown → 最终结果只有允许的标签
 */
function renderSimpleMarkdown(text: string): string {
  // 第一步：转义所有 HTML 特殊字符（防止 XSS）
  const escaped = escapeHtml(text);

  // 第二步：应用 Markdown 转换（使用占位符避免冲突）
  return (
    escaped
      // **强调** → <strong>强调</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // *斜体* → <em>斜体</em>
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 美化中英文引号："text" → 「text」、'text' → 『text』
    //.replace(/"([^&]+)"/g, '「$1」')
    //.replace(/'([^&#]+)'/g, '『$1』')
  );
}

/**
 * 预处理思维链标签，移除 </think> 或 </thinking> 之前的所有内容
 */
function preprocessThinkTags(message: string): string {
  // 匹配 </think> 或 </thinking> 闭合标签
  const closeTagPattern = /<\/think.*>/i;
  const closeMatch = message.match(closeTagPattern);

  if (closeMatch) {
    // 找到闭合标签的位置，返回该标签之后的内容
    const endIndex = closeMatch.index! + closeMatch[0].length;
    return message.slice(endIndex);
  }

  // 如果没有找到闭合标签，检查是否有未闭合的 <think> 或 <thinking> 标签
  const openTagPattern = /<(think|thinking)>/i;
  const openMatch = message.match(openTagPattern);

  if (openMatch) {
    // 找到开始标签的位置，返回该标签之前的内容
    return message.slice(0, openMatch.index);
  }

  return message;
}

function parseNarrativeMessage(message: string) {
  // 预处理思维链标签
  const cleanedMessage = preprocessThinkTags(message);

  // 提取 CONTEXT
  const contextMatch = cleanedMessage.match(/<(CONTEXT|content)>([\s\S]*?)<\/(CONTEXT|content)>/);
  const rawContext = (contextMatch ? contextMatch[2] : cleanedMessage).trim();
  // 应用类 Markdown 渲染
  extractedContext.value = renderSimpleMarkdown(rawContext);

  // 提取 OPTIONS
  const optionsMatch = cleanedMessage.match(/<OPTIONS>([\s\S]*?)<\/OPTIONS>/);
  if (optionsMatch) {
    const lines = optionsMatch[1]
      .trim()
      .split('\n')
      .filter(l => l.trim());
    options.value = lines.map((line, idx) => {
      const parts = line.match(/^[([【](.+?)[)\]】]\s*(.+)/);
      return {
        id: `opt-dynamic-${idx + 1}`,
        title: parts ? parts[1] : `行动 ${idx + 1}`,
        content: parts ? parts[2] : line.trim(),
      };
    });
  }

  // 提取 UpdateVariable
  const varMatch = cleanedMessage.match(/<UpdateVariable>([\s\S]*?)<\/UpdateVariable>/i);
  extractedVariables.value = varMatch ? varMatch[1].trim() : '';

  rawCurrentMessage.value = extractedContext.value;
}

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

const sortedOptions = computed(() => {
  // 将自定义选项放在列表最后，动态选项保持原有顺序
  const dynamic = options.value.filter(o => o.id.startsWith('opt-dynamic'));
  const custom = options.value.filter(o => !o.id.startsWith('opt-dynamic'));
  return [...dynamic, ...custom];
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
  const match = characterProfiles.value.find(item => item.key === activeCharacterKey.value);
  return match ?? characterProfiles.value[0];
});

const activeCharacterState = computed(() => {
  const profile = activeCharacter.value;
  const vars = chatVariablesSnapshot.value;

  const mood =
    _.get(vars, `${profile.name}.当前位置`) ??
    _.get(vars, `角色状态.${profile.name}.当前位置`) ??
    _.get(vars, `角色.${profile.name}.当前位置`) ??
    profile.mood;

  const location =
    _.get(vars, `${profile.name}.当前位置`) ??
    _.get(vars, `角色状态.${profile.name}.当前位置`) ??
    _.get(vars, `角色.${profile.name}.当前位置`) ??
    profile.location;

  const outfit =
    _.get(vars, `${profile.name}.着装`) ??
    _.get(vars, `角色状态.${profile.name}.着装`) ??
    _.get(vars, `角色.${profile.name}.着装`) ??
    profile.outfit;

  const keyItemsSource =
    _.get(vars, `${profile.name}.关键物品`) ??
    _.get(vars, `角色状态.${profile.name}.关键物品`) ??
    _.get(vars, `角色.${profile.name}.关键物品`) ??
    profile.keyItems;

  let keyItemsText: string;
  if (typeof keyItemsSource === 'string' || keyItemsSource == null) {
    keyItemsText = keyItemsSource || profile.keyItems || '暂无特别标记的物品';
  } else {
    const entries = Object.entries(keyItemsSource as Record<string, { 描述?: string; 数量?: number }>);
    keyItemsText =
      entries
        .map(([name, info]) => {
          const count = info?.数量;
          if (count != null && count !== 1) return `${name}×${count}`;
          return name;
        })
        .join('、') || '暂无特别标记的物品';
  }

  return {
    当前心情: String(mood),
    所在位置: String(location),
    当前着装: String(outfit),
    当前关键物品: keyItemsText,
  };
});

const shopPopularity = computed(() => {
  const raw = store.data.店铺人气 ?? {};
  return {
    rabbitHouse: Number(raw['Rabbit House'] ?? 0),
    甘兔庵: Number(raw.甘兔庵 ?? 0),
    fleur: Number(raw['Fleur de Lapin'] ?? 0),
    brightBunny: Number(raw['Bright Bunny'] ?? 0),
  };
});

const worldInfo = computed(() => {
  const raw = store.data.世界 ?? {};
  const recentEvents = raw.近期事务 ?? {};
  const eventsArray = Object.entries(recentEvents).map(([name, desc]) => ({
    name,
    desc: String(desc),
  }));
  return {
    time: String(raw.当前时间 ?? '--'),
    location: String(raw.当前地点 ?? '--'),
    season: String(raw.当前季节 ?? '--'),
    weather: String(raw.当前天气 ?? '--'),
    recentEvents: eventsArray,
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

/**
 * 从 HTML 中提取纯文本（用于打字机效果）
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
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

  // 打字机模式：先显示纯文本，完成后应用 HTML
  const plainText = stripHtml(text);
  const chars = Array.from(plainText);
  displayedMessage.value = '';
  let index = 0;

  typewriterTimer = window.setInterval(
    () => {
      index += 1;
      displayedMessage.value = chars.slice(0, index).join('');
      if (index >= chars.length) {
        clearTypewriterTimer();
        // 打字机效果完成后，应用完整的 HTML 渲染
        displayedMessage.value = text;
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

function syncLastMessageId(): number {
  const value = getLastMessageId();
  lastMessageId.value = value;
  return value;
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

function viewWorldbookDetail(entry: WorldbookEntry): void {
  selectedEntry.value = entry;
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

function refreshDataStore(): void {
  useDataStore = defineMvuDataStore(Schema, { type: 'message', message_id: syncLastMessageId() });
  store = useDataStore();
}

function refreshChatVariablesSnapshot(): void {
  try {
    chatVariablesSnapshot.value = getVariables({ type: 'chat' });
    refreshDataStore();
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

  lastMessageRaw.value = latest;
  parseNarrativeMessage(latest.message);
  scrollStoryIfNeeded();
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

  if (isBusyGenerating.value) return;
  isBusyGenerating.value = true;

  try {
    await createChatMessages([{ role: 'user', message: clean }]);

    const result = await generate({
      user_input: clean,
      should_stream: false,
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

  options.value.push({ id: `opt-custom-${Date.now()}`, title: '自定义行动', content: value });
  customOption.value = '';
  await handleOption(value);
}

async function handleSwipe(): Promise<void> {
  if (isBusyGenerating.value) return;
  isBusyGenerating.value = true;
  try {
    // 获取最后一条消息 ID
    const lastId = syncLastMessageId();

    // 调用 generate 重新生成回复
    const result = SillyTavern.generate('regenerate');

    rawCurrentMessage.value = result;
    refreshLatestAssistantMessage();
    toastr.success('已重新生成回复。');
  } catch (error) {
    toastr.error('重生成失败。');
    console.error(error);
  } finally {
    isBusyGenerating.value = false;
  }
}

function openEditLastMessage(): void {
  const lastId = syncLastMessageId();
  const msg = getChatMessages(lastId)[0] as ChatMessage | undefined;
  if (!msg) return;

  editingMessageText.value = msg.message;
  isEditingMessageVisible.value = true;
}

function cancelEdit(): void {
  isEditingMessageVisible.value = false;
}

async function saveEditedMessage(): Promise<void> {
  const lastId = syncLastMessageId();
  if (!editingMessageText.value.trim()) return;

  try {
    // 使用酒馆 API 更新消息内容，设置 refresh: 'none' 避免 iframe 重新渲染
    await setChatMessages([{ message_id: lastId, message: editingMessageText.value.trim() }], { refresh: 'none' });

    // 手动更新界面状态（类似 refreshLatestAssistantMessage 的做法，不触发 iframe 重新渲染）
    isEditingMessageVisible.value = false;

    // 获取更新后的消息并解析
    const updatedMsg = getChatMessages(lastId)[0] as ChatMessage | undefined;
    if (updatedMsg && typeof updatedMsg.message === 'string') {
      lastMessageRaw.value = updatedMsg;
      parseNarrativeMessage(updatedMsg.message);
      scrollStoryIfNeeded();
    }

    // 刷新历史记录
    loadHistory(false);

    toastr.success('消息已修改。');
  } catch (error) {
    toastr.error('修改保存失败。');
    console.error(error);
  }
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
  if (isEditingMessageVisible.value) {
    cancelEdit();
    return;
  }
  if (isFeatureModalVisible.value) {
    closeFeatureModal();
  }
}

function toggleWorldMinimized(): void {
  isWorldMinimized.value = !isWorldMinimized.value;
}

function toggleShopPopularityMinimized(): void {
  isShopPopularityMinimized.value = !isShopPopularityMinimized.value;
}

function onShopPopularityDragStart(event: MouseEvent | TouchEvent): void {
  isDraggingShopPopularity.value = true;
  const point = 'touches' in event ? event.touches[0] : event;
  dragOffset.value = {
    x: point.clientX - shopPopularityPosition.value.x,
    y: point.clientY - shopPopularityPosition.value.y,
  };
}

function onShopPopularityDragMove(event: MouseEvent | TouchEvent): void {
  if (!isDraggingShopPopularity.value) return;
  const point = 'touches' in event ? event.touches[0] : event;
  const x = point.clientX - dragOffset.value.x;
  const y = point.clientY - dragOffset.value.y;
  shopPopularityPosition.value = { x, y };
}

function onShopPopularityDragEnd(): void {
  isDraggingShopPopularity.value = false;
}

async function initializeForCurrentChat(): Promise<void> {
  syncLastMessageId();
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
  upsertMetaDescription('高沉浸文字互动体验，支持选项驱动叙事与世界书联动。');
  document.addEventListener('keydown', onGlobalKeydown);
  window.addEventListener('mousemove', onShopPopularityDragMove);
  window.addEventListener('mouseup', onShopPopularityDragEnd);
  window.addEventListener('touchmove', onShopPopularityDragMove);
  window.addEventListener('touchend', onShopPopularityDragEnd);

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
  window.removeEventListener('mousemove', onShopPopularityDragMove);
  window.removeEventListener('mouseup', onShopPopularityDragEnd);
  window.removeEventListener('touchmove', onShopPopularityDragMove);
  window.removeEventListener('touchend', onShopPopularityDragEnd);
});
</script>
