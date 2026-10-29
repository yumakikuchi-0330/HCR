import React from "react";
import { render , screen } from '@testing-library/react';
import { StatusBadge } from './index';

describe('StatusBadge', () => {
  test('渡したラベルが表示される', () => {
    render(<StatusBadge label="受診前" situation="before" />);
    expect(screen.getByText('受診前')).toBeInTheDocument();
  });
  test('共通の status-badge クラスが付く', () => {
    render(<StatusBadge label="受診前" situation="before"/>);
    expect(screen.getByText('受診前')).toHaveClass('status-badge');
  });
    test('situation="before" のとき status-badge--before クラスが付く', () => {
    render(<StatusBadge label="受診前" situation="before" />);
    expect(screen.getByText('受診前')).toHaveClass('status-badge--before');
  });
  test('situation="inProgress" のとき status-badge--inProgress クラスが付く', () => {
    render(<StatusBadge label="診察中" situation="inProgress" />);
    expect(screen.getByText('診察中')).toHaveClass('status-badge--inProgress');
  });
  test('situation="complete" のとき status-badge--complete クラスが付く', () => {
    render(<StatusBadge label="完了" situation="complete" />);
    expect(screen.getByText('完了')).toHaveClass('status-badge--complete');
  });
  test('situation="cancel" のとき status-badge--cancel クラスが付く', () => {
    render(<StatusBadge label="キャンセル" situation="cancel" />);
    expect(screen.getByText('キャンセル')).toHaveClass('status-badge--cancel');
  });
});
