import type { RoleplayOption } from '../stores/gameStore';

export interface AiReplyParseResult {
  context: string;
  options: RoleplayOption[];
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

interface TagPosition {
  open: number;
  close: number;
}

function extractTagContent(message: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = message.match(regex);
  return match ? match[1].trim() : null;
}

function findTagPosition(message: string, tag: string): TagPosition {
  const normalized = message.toLowerCase();
  const tagName = tag.toLowerCase();

  return {
    open: normalized.indexOf(`<${tagName}>`),
    close: normalized.indexOf(`</${tagName}>`),
  };
}

function validateTagOrder(message: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const context = findTagPosition(message, 'CONTEXT');
  const updateVariable = findTagPosition(message, 'UpdateVariable');
  const options = findTagPosition(message, 'OPTIONS');

  const validateTagPair = (tag: string, position: TagPosition, required: boolean) => {
    const bothMissing = position.open === -1 && position.close === -1;
    if (bothMissing) {
      if (required) {
        errors.push(`缺少标签 <${tag}>...</${tag}>`);
      }
      return;
    }

    if (position.open === -1 || position.close === -1) {
      if (required) {
        errors.push(`标签 <${tag}> 或 </${tag}> 缺失`);
      } else {
        warnings.push(`可选标签 <${tag}> 或 </${tag}> 缺失`);
      }
      return;
    }

    if (position.close <= position.open) {
      if (required) {
        errors.push(`标签 <${tag}> 的起止顺序错误`);
      } else {
        warnings.push(`可选标签 <${tag}> 的起止顺序错误`);
      }
    }
  };

  validateTagPair('CONTEXT', context, true);
  validateTagPair('UpdateVariable', updateVariable, false);
  validateTagPair('OPTIONS', options, true);

  const hasContext = context.open !== -1 && context.close > context.open;
  const hasOptions = options.open !== -1 && options.close > options.open;

  if (hasContext && hasOptions && context.close > options.open) {
    errors.push('标签顺序不符合 <CONTEXT> -> <OPTIONS> 规范');
  }

  const hasValidUpdateVariable = updateVariable.open !== -1 && updateVariable.close > updateVariable.open;
  if (hasValidUpdateVariable && hasContext && hasOptions) {
    if (updateVariable.open < context.close || updateVariable.close > options.open) {
      warnings.push('可选标签 <UpdateVariable> 建议位于 <CONTEXT> 与 <OPTIONS> 之间');
    }
  }

  return { errors, warnings };
}

function parseOptions(optionsText: string): { options: RoleplayOption[]; errors: string[] } {
  const lines = optionsText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      options: [],
      errors: ['<OPTIONS> 中未提供可用选项'],
    };
  }

  const errors: string[] = [];
  const options = lines.map((line, index) => {
    const match = line.match(/^\[([^\]]+)\]\s*(.+)$/);
    if (!match) {
      errors.push(`选项第 ${index + 1} 行格式不正确：${line}`);
      return {
        id: `option-${index}`,
        title: '[选项]',
        content: line,
        isCustom: false,
      } satisfies RoleplayOption;
    }

    return {
      id: `option-${index}`,
      title: `[${match[1]}]`,
      content: match[2].trim(),
      isCustom: false,
    } satisfies RoleplayOption;
  });

  return { options, errors };
}

export function parseAiReply(message: string): AiReplyParseResult {
  const { errors, warnings } = validateTagOrder(message);

  const context = extractTagContent(message, 'CONTEXT') ?? '';
  const optionsText = extractTagContent(message, 'OPTIONS') ?? '';

  if (!context) {
    errors.push('<CONTEXT> 为空或缺失正文');
  }

  const { options, errors: optionErrors } = parseOptions(optionsText);
  errors.push(...optionErrors);

  return {
    context,
    options,
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}
