import { createSystem, defaultConfig } from '@chakra-ui/react';

// Chakra UIの設定
// preflight（CSSリセット）とglobalCss（body等の全体スタイル）を無効にして、
// 既存コンポーネントの見た目が変わらないようにする
export const system = createSystem({
  ...defaultConfig,
  preflight: false,
  globalCss: {},
});
