<template>
  <section>
    <MessageDisplay :message="gameStore.currentMessage" :message-id="gameStore.currentMessageId" />

    <OptionsPanel :options="gameStore.options" :disabled="gameStore.isGenerating" @select="handleSelect" />

    <div class="meta card">
      <div>主视角：{{ gameStore.selectedPov ?? characterStore.mvuData?._主视角 ?? '未知' }}</div>
      <div>当前场景角色：{{ sceneCharactersText }}</div>
      <button class="refresh-btn" :disabled="gameStore.isLoading" @click="refreshAll">
        {{ gameStore.isLoading ? '刷新中...' : '刷新消息' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useCharacterStore } from '../stores/characterStore';
import { useGameStore, type RoleplayOption } from '../stores/gameStore';
import MessageDisplay from './MessageDisplay.vue';
import OptionsPanel from './OptionsPanel.vue';

const gameStore = useGameStore();
const characterStore = useCharacterStore();

const sceneCharactersText = computed(() => {
  const list = characterStore.getCurrentSceneCharacters();
  return list.length > 0 ? list.join(' / ') : '无';
});

type AssistantMessageLike = {
  message_id: number;
  message: string;
};

function isAssistantMessageLike(value: unknown): value is AssistantMessageLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message_id' in value &&
    'message' in value &&
    typeof (value as { message_id?: unknown }).message_id === 'number' &&
    typeof (value as { message?: unknown }).message === 'string'
  );
}

function parseOptionsFromMessage(message: string): RoleplayOption[] {
  const block = message.match(/<roleplay_options>([\s\S]*?)<\/roleplay_options>/i);
  if (!block) return [];

  const lines = block[1]
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const options: RoleplayOption[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const matched = line.match(/^(.+?)[:：]\s*(.+)$/);
    if (!matched) continue;
    options.push({
      id: `opt-${i}-${Date.now()}`,
      title: matched[1].trim(),
      content: matched[2]
        .trim()
        .replace(/^「(.+)」$/, '$1')
        .replace(/^\$\{(.+)\}$/, '$1'),
    });
  }
  return options;
}

async function loadLatestAssistantMessage() {
  const latestId = getLastMessageId();
  if (latestId < 0) {
    gameStore.setMessage(gameStore.getOpeningLine(), 0);
    gameStore.setOptions([]);
    return;
  }

  let current: AssistantMessageLike | undefined;
  for (let id = latestId; id >= 0; id -= 1) {
    const messages = getChatMessages(id, { role: 'assistant', hide_state: 'all' });
    const candidate = messages[0];
    if (isAssistantMessageLike(candidate)) {
      current = candidate;
      break;
    }
  }

  if (!current) {
    gameStore.setMessage(gameStore.getOpeningLine(), 0);
    gameStore.setOptions([]);
    return;
  }

  if (current.message_id === 0) {
    gameStore.setMessage(gameStore.getOpeningLine(), 0);
    gameStore.setOptions([]);
    return;
  }

  gameStore.setMessage(current.message, current.message_id);
  gameStore.setOptions(parseOptionsFromMessage(current.message));
}

async function refreshAll() {
  gameStore.setLoading(true);
  try {
    await characterStore.refresh();
    await loadLatestAssistantMessage();
  } finally {
    gameStore.setLoading(false);
  }
}

async function handleSelect(option: RoleplayOption) {
  if (gameStore.isGenerating) return;

  gameStore.setGenerating(true);
  try {
    await createChatMessages([
      {
        role: 'user',
        message: option.content,
      },
    ]);

    await triggerSlash('/trigger');
    await refreshAll();
  } catch (error) {
    console.error('[同层前端_v3] 发送选项失败:', error);
  } finally {
    gameStore.setGenerating(false);
  }
}

let stopRendered: { stop: () => void } | null = null;

onMounted(async () => {
  await characterStore.initialize();
  await refreshAll();

  stopRendered = eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, async () => {
    await refreshAll();
  });
});

onUnmounted(() => {
  stopRendered?.stop();
  stopRendered = null;
});
</script>

<style scoped lang="scss">
.meta {
  margin-top: 12px;
  padding: 10px;
  display: grid;
  gap: 8px;
}

.refresh-btn {
  justify-self: start;
  border: 1px solid var(--border-color);
  background: var(--secondary-bg);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
