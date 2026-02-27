import { defineStore } from 'pinia';
import type { Ref } from 'vue';

// 选项类型
export interface RoleplayOption {
  id: string;
  title: string;
  content: string;
  isCustom?: boolean;
}

// 页面类型
export type PageName = 'start' | 'game' | 'character' | 'history' | 'worldbook' | 'settings';

// 游戏状态
export interface GameState {
  currentPage: PageName;
  currentMessage: string;
  currentMessageId: number;
  options: RoleplayOption[];
  currentCharacters: string[];
  isCharacterBarCollapsed: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  isGenerating: boolean;
}

export const useGameStore = defineStore('game', () => {
  // 页面状态
  const currentPage: Ref<PageName> = ref('start');

  // 消息状态
  const currentMessage = ref('');
  const currentMessageId = ref(0);

  // 选项状态
  const options: Ref<RoleplayOption[]> = ref([]);

  // 角色状态
  const currentCharacters: Ref<string[]> = ref([]);

  // UI 状态
  const isCharacterBarCollapsed = ref(false);
  const isFullscreen = ref(false);
  const isLoading = ref(false);
  const isGenerating = ref(false);

  // 选中的角色（用于详情页）
  const selectedCharacter = ref<string | null>(null);

  // 页面导航
  function navigateTo(page: PageName) {
    currentPage.value = page;
  }

  // 更新消息
  function updateMessage(message: string, messageId: number) {
    currentMessage.value = message;
    currentMessageId.value = messageId;
  }

  // 更新选项
  function updateOptions(newOptions: RoleplayOption[]) {
    options.value = newOptions;
  }

  // 添加自定义选项
  function addCustomOption(title: string, content: string) {
    const newOption: RoleplayOption = {
      id: `custom-${Date.now()}`,
      title: title || '自定义行动',
      content,
      isCustom: true,
    };
    options.value.push(newOption);
  }

  // 移除选项
  function removeOption(optionId: string) {
    const index = options.value.findIndex(opt => opt.id === optionId);
    if (index !== -1) {
      options.value.splice(index, 1);
    }
  }

  // 更新当前场景角色
  function updateCurrentCharacters(characters: string[]) {
    currentCharacters.value = characters;
  }

  // 切换角色栏折叠状态
  function toggleCharacterBar() {
    isCharacterBarCollapsed.value = !isCharacterBarCollapsed.value;
  }

  // 切换全屏
  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value;
    if (isFullscreen.value) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // 选择角色
  function selectCharacter(name: string | null) {
    selectedCharacter.value = name;
  }

  // 设置加载状态
  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  // 设置生成状态
  function setGenerating(generating: boolean) {
    isGenerating.value = generating;
  }

  return {
    // State
    currentPage,
    currentMessage,
    currentMessageId,
    options,
    currentCharacters,
    isCharacterBarCollapsed,
    isFullscreen,
    isLoading,
    isGenerating,
    selectedCharacter,

    // Actions
    navigateTo,
    updateMessage,
    updateOptions,
    addCustomOption,
    removeOption,
    updateCurrentCharacters,
    toggleCharacterBar,
    toggleFullscreen,
    selectCharacter,
    setLoading,
    setGenerating,
  };
});
