import React from 'react';
import { render, screen } from '@testing-library/react';
// MemoryRouter: テスト用のルーター（Homeの中で useNavigate を使っているので必要）
import { MemoryRouter } from 'react-router-dom';
// ChakraProvider: Chakra UIの部品を使うために必要な「外枠」
import { ChakraProvider } from '@chakra-ui/react';
// アプリ本体と同じChakraの設定を読み込む
import { system } from '../../system';
import Home from './index';
import { fetchReservationsDate } from '../../api/reservations';
import { fetchPatients } from '../../api/patients';

// jest.mock: ファイルの中身を丸ごと偽物に差し替える（本物のサーバーに通信しないようにする）
jest.mock('../../api/reservations');
jest.mock('../../api/patients');
// カレンダーはテストに関係なく、テスト環境で動かしにくいので、ただの文字に差し替える
jest.mock('../../components/Calendar', () => () => <div>カレンダー</div>);

// 偽物になった関数を「jest.Mock型」として扱う（TypeScriptに偽物だと教えるため）
const mockFetchReservationsDate = fetchReservationsDate as jest.Mock;
const mockFetchPatients = fetchPatients as jest.Mock;

// 毎回同じ外枠で描画するので、関数にまとめておく
const renderHome = () =>
  render(
    // 本番の index.tsx と同じように ChakraProvider で包む
    <ChakraProvider value={system}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </ChakraProvider>
  );

describe('Home', () => {
  test('予約データが表で表示される', async () => {
    mockFetchReservationsDate.mockResolvedValue([
      { id: 'r1', patientId: 'p1', courseId: 'dock', date: '2026-10-29', time: '09:00', options: [], status: 'before' },
    ]);
    mockFetchPatients.mockResolvedValue([
      { id: 'p1', name: '山田太郎', nameKana: 'やまだたろう', birthDate: '1990-01-01', gender: '男性' },
    ]);
    renderHome();
    expect(await screen.findByText('山田太郎')).toBeInTheDocument();
    expect(screen.getByText('人間ドック')).toBeInTheDocument();
  });
  test('予約が0件のときメッセージが出る', async () => {
    mockFetchReservationsDate.mockResolvedValue([]);
    mockFetchPatients.mockResolvedValue([]);
    renderHome();
    expect(await screen.findByText('この日の予約はありません')).toBeInTheDocument();
  });
  test('取得に失敗したときエラーメッセージが出る', async () => {
    mockFetchReservationsDate.mockRejectedValue(new Error('通信エラー'));
    mockFetchPatients.mockResolvedValue([]);
    renderHome();
    expect(await screen.findByText('予約データの取得に失敗しました')).toBeInTheDocument();
  });
});
