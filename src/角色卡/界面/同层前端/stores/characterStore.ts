import waitUntil from 'async-wait-until';
import _ from 'lodash';
import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { Schema } from '../../../schema';

// 角色名称映射（中文名 -> 英文文件名）
export const CHARACTER_NAME_MAP: Record<string, string> = {
  保登心爱: 'qjltca',
  香风智乃: '6t09pw',
  天天座理世: 'n9szhx',
  宇治松千夜: 'v4spnt',
  桐间纱路: 'b982xz',
  条河麻耶: 'bmw44n',
  奈津惠: 'koovsy',
  风衣叶冬优: 'lckv74',
  神沙夏明: 'usclrp',
  神沙映月: 'r10sh1',
  狩手结良: 'a3uv0i',
  青山蓝山: 'x18i00',
  真手凛: 'kk59ir',
  保登摩卡: 'hi872c',
};

// 角色颜色映射
export const CHARACTER_COLOR_MAP: Record<string, string> = {
  保登心爱: 'var(--clr-cocoa)',
  香风智乃: 'var(--clr-chino)',
  天天座理世: 'var(--clr-rize)',
  宇治松千夜: 'var(--clr-chiya)',
  桐间纱路: 'var(--clr-syaro)',
  条河麻耶: 'var(--clr-maya)',
  奈津惠: 'var(--clr-megu)',
  风衣叶冬优: 'var(--clr-fuyu)',
  神沙夏明: 'var(--clr-natsume)',
  神沙映月: 'var(--clr-eru)',
  狩手结良: 'var(--clr-yura)',
  青山蓝山: 'var(--clr-aoyama)',
  真手凛: 'var(--clr-mate)',
  保登摩卡: 'var(--clr-mocha)',
};

// 角色数据类型
export interface CharacterData {
  当前位置: string;
  心情状态: string;
  着装: string;
  关键物品: Record<string, { 描述: string; 数量: number }>;
}

// 获取角色立绘路径
export function getCharacterPortrait(name: string): string {
  const fileName = CHARACTER_NAME_MAP[name];
  if (fileName) {
    // 使用相对路径指向 assets/portraits
    return `https://files.catbox.moe/${fileName}.png`;
  }
  return '';
}

// 获取角色颜色
export function getCharacterColor(name: string): string {
  return CHARACTER_COLOR_MAP[name] || 'var(--text-primary)';
}

export const useCharacterStore = defineStore('character', () => {
  // MVU 数据
  const mvuData: Ref<z.infer<typeof Schema> | null> = ref(null);
  const isInitialized = ref(false);
  let stopMessageListener: { stop: () => void } | null = null;

  // 初始化 MVU 数据
  async function initialize() {
    if (isInitialized.value) return;

    try {
      // 等待 MVU 框架初始化
      await waitGlobalInitialized('Mvu');

      // 等待消息楼层变量被正确设置
      await waitUntil(() => {
        const data = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
        return _.has(data, 'stat_data');
      });

      // 获取数据
      await refreshData();

      isInitialized.value = true;
      console.info('[角色数据] 初始化成功');
    } catch (e) {
      console.error('[角色数据] 初始化失败:', e);
    }
  }

  // 刷新数据
  async function refreshData() {
    try {
      const data = Mvu.getMvuData({ type: 'message', message_id: getCurrentMessageId() });
      const statData = _.get(data, 'stat_data');
      if (statData) {
        mvuData.value = Schema.parse(statData);
      }
    } catch (e) {
      console.warn('[角色数据] 刷新失败:', e);
    }
  }

  // 获取角色数据
  function getCharacterData(name: string): CharacterData | null {
    if (!mvuData.value) return null;
    return (mvuData.value as Record<string, unknown>)[name] as CharacterData | null;
  }

  // 获取当前场景角色列表
  function getCurrentSceneCharacters(): string[] {
    if (!mvuData.value) return [];
    return mvuData.value.当前场景角色 || [];
  }

  // 获取世界信息
  function getWorldInfo() {
    if (!mvuData.value) return null;
    return mvuData.value.世界;
  }

  // 获取主视角角色
  function getMainPOV(): string {
    if (!mvuData.value) return '无';
    return mvuData.value._主视角 || '无';
  }

  // 监听消息变化刷新数据
  function setupMessageListener() {
    if (stopMessageListener) return;

    stopMessageListener = eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, async () => {
      await refreshData();
    });
  }

  function cleanupMessageListener() {
    stopMessageListener?.stop();
    stopMessageListener = null;
  }

  return {
    mvuData,
    isInitialized,
    initialize,
    refreshData,
    getCharacterData,
    getCurrentSceneCharacters,
    getWorldInfo,
    getMainPOV,
    setupMessageListener,
    cleanupMessageListener,
  };
});
