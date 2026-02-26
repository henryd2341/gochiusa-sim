import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

export const Schema = z.object({
  世界: z.object({
    当前时间: z.string().describe('%M-%d %H:%i'),
    当前地点: z.string(),
    当前季节: z.enum(['春', '夏', '秋', '冬']),
    当前天气: z.string(),
    近期事务: z.record(z.string().describe('事务名'), z.string().describe('事务描述')),
  }),

  _主视角: z.enum(['无', '保登心爱', '香风智乃', '天天座理世', '宇治松千夜', '桐间纱路']),

  当前场景角色: z.array(z.string()),

  保登心爱: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  香风智乃: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  天天座理世: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  宇治松千夜: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  桐间纱路: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  条河麻耶: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  奈津惠: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  风衣叶冬优: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  神沙夏明: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  神沙映月: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  狩手结良: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  青山蓝山: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  真手凛: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  保登摩卡: z.object({
    当前位置: z.string(),
    心情状态: z.string(),
    着装: z.string(),
    关键物品: z
      .record(
        z.string().describe('物品名'),
        z.object({
          描述: z.string(),
          数量: z.coerce.number(),
        }),
      )
      .transform(data => _.pickBy(data, ({ 数量 }) => 数量 > 0)),
  }),

  店铺人气: z.object({
    'Rabbit House': z.coerce.number().transform(v => _.clamp(v, 0, 100)),
    甘兔庵: z.coerce.number().transform(v => _.clamp(v, 0, 100)),
    'Fleur de Lapin': z.coerce.number().transform(v => _.clamp(v, 0, 100)),
    'Bright Bunny': z.coerce.number().transform(v => _.clamp(v, 0, 100)),
  }),
});

$(() => {
  registerMvuSchema(Schema);
});
