import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// デザインのタイポグラフィ（fontSize="h2" のようにトークン名で使う）
const typographyConfig = defineConfig({
  theme: {
    tokens: {
      fontSizes: {
        h1: { value: '32px' }, // 太字で使う
        h2: { value: '24px' }, // 太字で使う
        label: { value: '18px' },
        body: { value: '16px' },
        text: { value: '14px' },
      },
    },
  },
});

// Chakra UIの設定
// preflight（CSSリセット）とglobalCss（body等の全体スタイル）を無効にして、
// 既存コンポーネントの見た目が変わらないようにする
export const system = createSystem(
  {
    ...defaultConfig,
    preflight: false,
    // preflight無効で消える [hidden] の非表示ルールだけ補う（DatePickerのビュー切替などで必要）
    globalCss: {
      '[hidden]': { display: 'none !important' },
    },
  },
  typographyConfig,
);
