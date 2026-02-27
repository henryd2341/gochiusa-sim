<template>
  <div class="message-display">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="!message" class="empty-state">
      <i class="fa-solid fa-comments"></i>
      <p>等待AI回复...</p>
    </div>

    <!-- Message Content -->
    <div v-else ref="contentRef" class="message-content">
      <div class="main-text" v-html="formattedMainContent"></div>
    </div>

    <!-- Generating Indicator -->
    <Transition name="fade">
      <div v-if="isGenerating" class="generating-indicator">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>AI 正在思考...</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { useGameStore } from '../stores/gameStore';

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  messageId: {
    type: Number,
    default: 0,
  },
  displayMode: {
    type: String as PropType<'instant' | 'typewriter' | 'segment'>,
    default: 'instant',
  },
});

const contentRef = ref<HTMLElement | null>(null);
const isLoading = ref(false);
const gameStore = useGameStore();
const isGenerating = computed(() => gameStore.isGenerating);
const displayedContent = ref('');
let typewriterTimer: ReturnType<typeof setTimeout> | null = null;
let typewriterRunId = 0;

const normalizedMessage = computed(() => {
  if (!props.message) return '';
  if (props.displayMode === 'segment') {
    return props.message
      .split(/\n{2,}/)
      .map(segment => segment.trim())
      .filter(Boolean)
      .join('\n\n');
  }
  return props.message;
});

// 格式化内容
const formattedMainContent = computed(() => {
  if (!displayedContent.value) return '';
  return formatMessage(displayedContent.value);
});

function clearTypewriterTimer() {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer);
    typewriterTimer = null;
  }
}

function getTypewriterDelay(char: string): number {
  if (/[,，、]/.test(char)) return 45;
  if (/[.。!?！？]/.test(char)) return 90;
  return 20;
}

function startTypewriter(content: string) {
  clearTypewriterTimer();
  typewriterRunId += 1;
  const currentRunId = typewriterRunId;

  displayedContent.value = '';
  const chars = Array.from(content);
  let index = 0;

  const tick = () => {
    if (currentRunId !== typewriterRunId) return;

    if (index >= chars.length) {
      clearTypewriterTimer();
      return;
    }

    const char = chars[index];
    displayedContent.value += char;
    index += 1;

    typewriterTimer = setTimeout(tick, getTypewriterDelay(char));
  };

  tick();
}

// 格式化消息内容
function formatMessage(content: string): string {
  // 使用酒馆助手的格式化函数
  let formatted = formatAsDisplayedMessage(content, {
    message_id: props.messageId,
  });

  // 应用角色颜色
  formatted = applyCharacterColors(formatted);

  return formatted;
}

// 应用角色颜色
function applyCharacterColors(html: string): string {
  const characterNames = [
    '保登心爱',
    '香风智乃',
    '天天座理世',
    '宇治松千夜',
    '桐间纱路',
    '条河麻耶',
    '奈津惠',
    '风衣叶冬优',
    '神沙夏明',
    '神沙映月',
    '狩手结良',
    '青山蓝山',
    '真手凛',
    '保登摩卡',
  ];

  let result = html;
  characterNames.forEach(name => {
    const color = getCharacterColor(name);
    // 匹配角色名后的引号内容
    const regex = new RegExp(`(${name})["「『]([^"」』]+)["」』]`, 'g');
    result = result.replace(regex, `<span style="color: ${color}; font-weight: 500;">$1</span>"$2"`);
  });

  return result;
}

// 获取角色颜色
function getCharacterColor(name: string): string {
  const colorMap: Record<string, string> = {
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
  return colorMap[name] || 'var(--text-primary)';
}

// 监听消息变化
watch(
  () => [props.message, props.displayMode],
  () => {
    if (!normalizedMessage.value) {
      clearTypewriterTimer();
      displayedContent.value = '';
      return;
    }

    if (props.displayMode === 'typewriter') {
      startTypewriter(normalizedMessage.value);
      return;
    }

    clearTypewriterTimer();
    displayedContent.value = normalizedMessage.value;
  },
  { immediate: true },
);

onUnmounted(() => {
  clearTypewriterTimer();
});
</script>

<style lang="scss" scoped>
.message-display {
  flex: 1;
  min-height: 200px;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  box-shadow: 0 4px 12px var(--card-shadow);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
  gap: var(--spacing-md);

  i {
    font-size: 48px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: var(--font-size-lg);
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.message-content {
  line-height: 1.8;
  font-size: var(--font-size-base);

  :deep(p) {
    margin-bottom: var(--spacing-md);
    text-indent: 2em;
  }

  :deep(strong) {
    color: var(--accent-color);
    font-weight: 600;
  }

  :deep(em) {
    font-style: italic;
    color: var(--text-secondary);
  }

  :deep(blockquote) {
    border-left: 3px solid var(--accent-color);
    padding-left: var(--spacing-md);
    margin: var(--spacing-md) 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: var(--spacing-xl);
    margin: var(--spacing-md) 0;
  }

  :deep(li) {
    margin-bottom: var(--spacing-xs);
  }

  :deep(code) {
    background: var(--secondary-bg);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    font-family: monospace;
    font-size: 0.9em;
  }

  :deep(pre) {
    background: var(--secondary-bg);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin: var(--spacing-md) 0;

    code {
      background: transparent;
      padding: 0;
    }
  }
}

.main-text {
  margin-bottom: var(--spacing-md);
}

.generating-indicator {
  position: absolute;
  bottom: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--secondary-bg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.typing-dots {
  display: flex;
  gap: 4px;

  span {
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: typingDot 1.4s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typingDot {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// Responsive
@media (max-width: 767px) {
  .message-display {
    padding: var(--spacing-md);
  }

  .message-content {
    font-size: var(--font-size-sm);
  }
}
</style>
