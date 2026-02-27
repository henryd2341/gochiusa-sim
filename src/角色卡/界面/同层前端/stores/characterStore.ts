import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface MvuStatData extends Record<string, unknown> {
  当前场景角色?: string[];
  _主视角?: string;
  世界?: Record<string, unknown>;
}

function resolveMessageId(input?: number): number {
  if (typeof input === 'number' && Number.isFinite(input) && input >= 0) return input;
  const latest = getLastMessageId();
  return latest >= 0 ? latest : 0;
}

function toStatData(value: unknown): MvuStatData | null {
  if (typeof value === 'object' && value !== null) return value as MvuStatData;
  return null;
}

export const useCharacterStore = defineStore('gochiusa-character-v3', () => {
  const isReady = ref(false);
  const mvuData = ref<MvuStatData | null>(null);

  async function initialize(messageId?: number) {
    if (!isReady.value) {
      await waitGlobalInitialized('Mvu');
      isReady.value = true;
    }
    await refresh(messageId);
  }

  async function refresh(messageId?: number) {
    if (!isReady.value) {
      await waitGlobalInitialized('Mvu');
      isReady.value = true;
    }

    try {
      const data = Mvu.getMvuData({ type: 'message', message_id: resolveMessageId(messageId) });
      mvuData.value = toStatData(data?.stat_data);
    } catch (error) {
      console.warn('[同层前端_v3] 读取 MVU 数据失败:', error);
      mvuData.value = null;
    }
  }

  function getCurrentSceneCharacters(): string[] {
    const names = mvuData.value?.当前场景角色;
    return Array.isArray(names) ? names : [];
  }

  return {
    isReady,
    mvuData,
    initialize,
    refresh,
    getCurrentSceneCharacters,
  };
});
