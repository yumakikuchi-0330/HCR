// React本体を読み込む（JSXを使うために必要）
import React from 'react';
// render: コンポーネントを仮想画面に描画する / screen: 画面から要素を探す
import { render, screen } from '@testing-library/react';
// userEvent: クリックや入力など「ユーザーの操作」を再現する道具
import userEvent from '@testing-library/user-event';
// テスト対象のTimeBoxコンポーネントを読み込む
import { TimeBox } from './index';
// 時間枠データの型（TypeScriptで正しい形のデータか確認するため）
import type { TimeSlot } from '../../types/type';

// テストで使う時間枠のデータ（本物のデータの代わりに用意する「テスト用データ」）
const slots: TimeSlot[] = [
  // 予約できる枠（空いている）
  { time: '09:00', isAvailable: true, reservedBy: null },
  // 予約できる枠だが、すでに誰かが予約済み
  { time: '10:00', isAvailable: true, reservedBy: '山田' },
  // そもそも予約を受け付けていない枠（画面に表示されないはず）
  { time: '11:00', isAvailable: false, reservedBy: null },
];

// TimeBoxに関するテストをひとまとめにする
describe('TimeBox', () => {
  // ① 受付可能な枠だけが表示されるか
  test('isAvailableがtrueの枠だけ表示される', () => {
    // onSelect は必須なので、何もしない関数を渡して描画する
    render(<TimeBox slots={slots} selectedTime={null} onSelect={() => {}} />);
    // 09:00 のボタンは表示されている
    expect(screen.getByRole('button', { name: '09:00' })).toBeInTheDocument();
    // 10:00 のボタンも表示されている（予約済みでも表示はされる）
    expect(screen.getByRole('button', { name: '10:00' })).toBeInTheDocument();
    // 11:00 は isAvailable が false なので表示されない
    // 「無いこと」を確かめるときは getBy ではなく queryBy を使う
    expect(screen.queryByRole('button', { name: '11:00' })).not.toBeInTheDocument();
  });

  // ② クリックすると onSelect が呼ばれるか
  test('ボタンをクリックすると onSelect に時間が渡される', () => {
    // jest.fn(): 「呼ばれたかどうか」「何を渡されたか」を記録できる偽物の関数
    const handleSelect = jest.fn();
    // 偽物の関数を onSelect として渡して描画する
    render(<TimeBox slots={slots} selectedTime={null} onSelect={handleSelect} />);
    // 09:00 のボタンをクリックする（ユーザーがクリックしたのと同じ動き）
    userEvent.click(screen.getByRole('button', { name: '09:00' }));
    // toHaveBeenCalledWith: 関数が '09:00' を受け取って呼ばれたか確認する
    expect(handleSelect).toHaveBeenCalledWith('09:00');
  });

  // ③ 予約済みの枠は押せないか
  test('予約済みの枠は押せない', () => {
    // 呼ばれたかどうかを記録する偽物の関数を用意する
    const handleSelect = jest.fn();
    // 描画する
    render(<TimeBox slots={slots} selectedTime={null} onSelect={handleSelect} />);
    // 予約済みの 10:00 のボタンを取得する
    const reservedButton = screen.getByRole('button', { name: '10:00' });
    // toBeDisabled: ボタンが押せない状態（disabled）になっているか確認する
    expect(reservedButton).toBeDisabled();
    // 押せないボタンをクリックしてみる
    userEvent.click(reservedButton);
    // not.toHaveBeenCalled: 関数が一度も呼ばれていないことを確認する
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
