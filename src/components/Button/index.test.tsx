// React本体を読み込む（JSX＝<Button /> のような書き方を使うために必要）
import React from 'react';
// render: コンポーネントをテスト用の仮想画面に描画する関数
// screen: 描画された画面から要素を探すための道具
import { render, screen } from '@testing-library/react';
// テスト対象のButtonコンポーネントを読み込む（同じフォルダの index.tsx）
import { Button } from './index';

// describe: 関連するテストをひとまとめにするグループ（ここでは「Button」についてのテスト）
describe('Button', () => {
  // test: 1つのテストケース。第1引数は「何を確かめるか」の説明文
  test('渡したテキストが表示される', () => {
    // Buttonを描画する。text に「送信」を渡す
    render(<Button text="送信" />);
    // 画面の中から「ボタン」の役割を持ち、名前が「送信」の要素を探す
    const button = screen.getByRole('button', { name: '送信' });
    // expect(実際の値).toBe〜(期待する状態) の形で結果を確かめる
    // toBeInTheDocument: 要素が画面上に存在することを確認する
    expect(button).toBeInTheDocument();
  });

  // sizeを指定しなかった場合の動きを確かめるテスト
  test('sizeを指定しないと medium クラスが付く', () => {
    // sizeを渡さずに描画する
    render(<Button text="OK" />);
    // 「OK」という名前のボタンを取得する
    const button = screen.getByRole('button', { name: 'OK' });
    // toHaveClass: 指定したCSSクラスが付いているか確認する
    expect(button).toHaveClass('medium');
  });

  // size="small" を渡した場合のテスト
  test('size="small" のとき small クラスが付く', () => {
    // sizeに small を指定して描画する
    render(<Button size="small" text="小" />);
    // 「小」という名前のボタンを取得する
    const button = screen.getByRole('button', { name: '小' });
    // small クラスが付いていることを確認する
    expect(button).toHaveClass('small');
  });

  // size="large" を渡した場合のテスト
  test('size="large" のとき large クラスが付く', () => {
    // sizeに large を指定して描画する
    render(<Button size="large" text="大" />);
    // 「大」という名前のボタンを取得する
    const button = screen.getByRole('button', { name: '大' });
    // large クラスが付いていることを確認する
    expect(button).toHaveClass('large');
    // not を付けると「〜ではない」の確認になる（medium クラスは付いていないはず）
    expect(button).not.toHaveClass('medium');
  });
});
