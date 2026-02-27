import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface RoleplayOption {
  id: string;
  title: string;
  content: string;
  isCustom?: boolean;
}

export const useGameStore = defineStore('gochiusa-game-v3', () => {
  const currentMessage = ref('');
  const currentMessageId = ref(-1);
  const options = ref<RoleplayOption[]>([]);
  const isGenerating = ref(false);
  const isLoading = ref(false);

  function setMessage(message: string, messageId: number) {
    currentMessage.value = message;
    currentMessageId.value = messageId;
  }

  function setOptions(next: RoleplayOption[]) {
    options.value = next;
  }

  function setGenerating(value: boolean) {
    isGenerating.value = value;
  }

  function setLoading(value: boolean) {
    isLoading.value = value;
  }

  return {
    currentMessage,
    currentMessageId,
    options,
    isGenerating,
    isLoading,
    setMessage,
    setOptions,
    setGenerating,
    setLoading,
  };
});
