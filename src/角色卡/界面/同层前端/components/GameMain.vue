<template>
  <div class="game-main">
    <!-- Top Navigation Bar -->
    <TopNavBar />

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Message Display Area -->
      <MessageDisplay
        :message="gameStore.currentMessage"
        :message-id="gameStore.currentMessageId"
        :display-mode="settingsStore.settings.messageDisplayMode"
      />

      <!-- Options Panel -->
      <OptionsPanel
        :options="gameStore.options"
        :allow-custom="settingsStore.settings.allowCustomOptions"
        @select="handleSelectOption"
      />
    </main>

    <!-- Character Bar (Collapsible) -->
    <CharacterBar
      v-if="settingsStore.settings.showCharacterBar"
      :collapsed="gameStore.isCharacterBarCollapsed"
      :characters="gameStore.currentCharacters"
      @toggle="gameStore.toggleCharacterBar"
      @select-character="handleSelectCharacter"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCharacterStore } from '../stores/characterStore';
import type { RoleplayOption } from '../stores/gameStore';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';
import { parseAiReply } from '../utils/aiReplyParser';
import CharacterBar from './CharacterBar.vue';
import MessageDisplay from './MessageDisplay.vue';
import OptionsPanel from './OptionsPanel.vue';
import TopNavBar from './TopNavBar.vue';

const router = useRouter();
const gameStore = useGameStore();
const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
let hasShownFormatWarning = false;
let stopMessageRenderedListener: { stop: () => void } | null = null;

// 初始化数据
onMounted(async () => {
  await initializeGame();
});

async function initializeGame() {
  try {
    // 刷新角色数据
    await characterStore.refreshData();

    // 获取当前消息
    await loadCurrentMessage();

    // 更新当前场景角色
    const characters = characterStore.getCurrentSceneCharacters();
    gameStore.updateCurrentCharacters(characters);

    console.info('[游戏主页面] 初始化完成');
  } catch (e) {
    console.error('[游戏主页面] 初始化失败:', e);
  }
}

// 加载当前消息
async function loadCurrentMessage() {
  try {
    // 获取最后一条AI消息
    const lastMessageId = SillyTavern.chat.length - 1;
    let assistantMessage: { message: string; message_id: number } | null = null;

    for (let i = lastMessageId; i >= 0; i--) {
      const msg = getChatMessages(i)[0];
      if (msg?.role === 'assistant') {
        assistantMessage = {
          message: msg.message,
          message_id: i,
        };
        break;
      }
    }

    if (!assistantMessage) {
      gameStore.updateMessage('', 0);
      gameStore.updateOptions([]);
      return;
    }

    const parsed = parseAiReply(assistantMessage.message);

    if (!parsed.isValid) {
      const fallbackMessage = parsed.context || 'AI 回复格式异常，请使用下方按钮重新生成。';
      gameStore.updateMessage(fallbackMessage, assistantMessage.message_id);
      gameStore.updateOptions([
        {
          id: 'system-reroll',
          title: '[系统]',
          content: '重 Roll（重新生成上一条 AI 回复）',
          isCustom: false,
        },
      ]);

      if (!hasShownFormatWarning) {
        hasShownFormatWarning = true;
        toastr.warning(`AI 回复格式异常：${parsed.errors.join('；')}`);
      }
      return;
    }

    hasShownFormatWarning = false;
    gameStore.updateMessage(parsed.context, assistantMessage.message_id);
    gameStore.updateOptions(parsed.options);
  } catch (e) {
    console.error('[游戏主页面] 加载消息失败:', e);
  }
}

// 处理选项选择
async function handleSelectOption(option: RoleplayOption) {
  if (gameStore.isGenerating) return;

  gameStore.setGenerating(true);

  try {
    if (option.id === 'system-reroll') {
      await triggerSlash('/trigger');
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadCurrentMessage();
      return;
    }

    // 在酒馆中创建用户消息
    await createChatMessages([
      {
        role: 'user',
        message: option.content,
      },
    ]);

    // 触发AI生成
    await triggerSlash('/trigger');

    // 等待消息渲染完成后刷新
    await new Promise(resolve => setTimeout(resolve, 500));
    await loadCurrentMessage();
    await characterStore.refreshData();

    // 更新当前场景角色
    const characters = characterStore.getCurrentSceneCharacters();
    gameStore.updateCurrentCharacters(characters);
  } catch (e) {
    console.error('[游戏主页面] 发送选项失败:', e);
    toastr.error('发送失败，请重试');
  } finally {
    gameStore.setGenerating(false);
  }
}

// 处理角色选择
function handleSelectCharacter(name: string) {
  gameStore.selectCharacter(name);
  router.push(`/character/${encodeURIComponent(name)}`);
}

// 监听消息变化
onMounted(() => {
  stopMessageRenderedListener = eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, async () => {
    await loadCurrentMessage();
    await characterStore.refreshData();
  });
});

onUnmounted(() => {
  stopMessageRenderedListener?.stop();
  stopMessageRenderedListener = null;
});
</script>

<style lang="scss" scoped>
.game-main {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px; // Space for character bar
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  gap: var(--spacing-lg);
  overflow-y: auto;
}

// Responsive
@media (min-width: 1024px) {
  .game-main {
    padding-bottom: 0;
  }

  .main-content {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding: var(--spacing-xl);
  }
}
</style>
