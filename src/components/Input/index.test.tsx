import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './index';

describe('Input', () => {
  test('ラベルが表示される', () => {
    render(<Input id="name" label="氏名" name="name" onChange={() => {}} />);
    expect(screen.getByLabelText('氏名')).toBeInTheDocument();
  });
  test('エラーメッセージを渡すと表示される', () => {
    render(<Input id="name" label="氏名" name="name" errorMessage="入力してください" onChange={() => {}} />);
    expect(screen.getByText('入力してください')).toBeInTheDocument();
    expect(screen.getByLabelText('氏名')).toHaveClass('input-field--error');
  });
  test('エラーメッセージがないときは表示されない', () => {
    render(<Input id="name" label="氏名" name="name" onChange={() => {}} />);
    expect(screen.queryByText('入力してください')).not.toBeInTheDocument();
    expect(screen.getByLabelText('氏名')).not.toHaveClass('input-field--error');
  });
});