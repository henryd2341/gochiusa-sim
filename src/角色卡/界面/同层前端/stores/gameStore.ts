import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface RoleplayOption {
  id: string;
  title: string;
  content: string;
  isCustom?: boolean;
}

const POV_STORAGE_KEY = 'gochiusa-sim.pov.v3';

const POV_OPENING_MAP: Record<string, string> = {
  保登心爱:
    '【开场】清晨的 Rabbit House 弥漫着新烘焙咖啡的香气。你推门而入，心爱正在柜台后朝你挥手，今天的故事从这一刻开始。',
  香风智乃: '【开场】咖啡杯沿升起细白热气。你安静地坐下，智乃把菜单轻轻推到你面前，视线在你与窗外晨光之间短暂停留。',
  天天座理世:
    '【开场】门铃清脆作响。理世利落地整理着围裙与杯具，向你点头示意。今天的每一步选择，都会让日常偏离原有轨道。',
  宇治松千夜: '【开场】和风甜点的香气从柜台另一侧飘来。千夜眯着眼微笑，把刚出炉的点心摆上托盘，邀请你参与今天的安排。',
  桐间纱路:
    '【开场】你刚落座，纱路已经把账本与托盘分门别类地摆好。她装作镇定地抬头，语速比平时略快地向你说明今天的计划。',
};

const DEFAULT_POV = '保登心爱';

function loadPov(): string | null {
  try {
    const value = localStorage.getItem(POV_STORAGE_KEY);
    return typeof value === 'string' && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export const useGameStore = defineStore('gochiusa-game-v3', () => {
  const currentMessage = ref('');
  const currentMessageId = ref(-1);
  const options = ref<RoleplayOption[]>([]);
  const isGenerating = ref(false);
  const isLoading = ref(false);
  const selectedPov = ref<string | null>(loadPov());

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

  function setPov(pov: string) {
    selectedPov.value = pov;
    try {
      localStorage.setItem(POV_STORAGE_KEY, pov);
    } catch {
      // ignore storage write failure in sandboxed iframe
    }
  }

  function getOpeningLine() {
    const pov = selectedPov.value ?? DEFAULT_POV;
    return POV_OPENING_MAP[pov] ?? POV_OPENING_MAP[DEFAULT_POV];
  }

  function listAvailablePov() {
    return Object.keys(POV_OPENING_MAP);
  }

  return {
    currentMessage,
    currentMessageId,
    options,
    isGenerating,
    isLoading,
    selectedPov,
    setMessage,
    setOptions,
    setGenerating,
    setLoading,
    setPov,
    getOpeningLine,
    listAvailablePov,
  };
});
