import { test, expect, type Page } from '@playwright/test';

const PAGE_PATH = '/reservations/new/time';
const DATE = '2026-11-09';
// この画面が使うAPI（患者1人分と、その日の予約一覧）
const PATIENT_URL = 'http://localhost:3001/patients/1';
const RESERVATIONS_URL = `http://localhost:3001/reservations?date=${DATE}`;

// テスト用の患者データ
const patient = {
  id: '1',
  name: '山田太郎',
  nameKana: 'ヤマダタロウ',
  birthDate: '1980-04-12',
  gender: '男性',
};

// テスト用の予約データ（10:00は予約済み、11:00はキャンセル済み）
const reservations = [
  {
    id: '1',
    patientId: '2',
    courseId: 'dock',
    date: DATE,
    time: '10:00',
    options: [],
    status: 'before',
  },
  {
    id: '2',
    patientId: '3',
    courseId: 'regular',
    date: DATE,
    time: '11:00',
    options: [],
    status: 'cancel',
  },
];

// 予約日登録画面から受け取るデータ
const locationState = { patientId: '1', courseId: 'dock', date: DATE };

// 前の画面から遷移してきた状態で開く
const openWithState = async (page: Page) => {
  await page.addInitScript((usr) => {
    window.history.replaceState({ usr, key: 'e2e', idx: 0 }, '', window.location.href);
  }, locationState);
  await page.goto(PAGE_PATH);
};

const getNavigationState = (page: Page) => page.evaluate(() => window.history.state.usr);
// API のモックをまとめて登録する
const routeApis = async (page: Page) => {
  await page.route(PATIENT_URL, (route) => route.fulfill({ json: patient }));
  await page.route(
    (url) => url.href === RESERVATIONS_URL,
    (route) => route.fulfill({ json: reservations }),
  );
};

const timeButton = (page: Page, time: string) =>
  page.getByRole('button', { name: time, exact: true });
test.describe('予約時間選択画面', () => {
  test.beforeEach(async ({ page }) => {
    await routeApis(page);
  });
  test.describe('前の画面から遷移してきた時', () => {
    test.beforeEach(async ({ page }) => {
      await openWithState(page);
    });
    test.describe('画面の表示', () => {
      test('選択中の内容（患者名/コース/日付）が表示される', async ({ page }) => {
        await expect(page.getByText('山田太郎/人間ドック/2026年11月9日')).toBeVisible();
      });
      test('ステッパーが時間選択', async ({ page }) => {
        await expect(page.locator('[aria-current="step"]')).toHaveText('2.時間選択');
      });
      test('予約できる時間が表示され、最初はどれも未選択', async ({ page }) => {
        for (const time of [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ]) {
          await expect(timeButton(page, time)).toHaveAttribute('aria-pressed', 'false');
        }
      });
      test('休憩時間は表示されない', async ({ page }) => {
        await expect(timeButton(page, '13:00')).toHaveCount(0);
      });
    });
    test.describe('予約状況の反映', () => {
      test('予約済み（10時）は押せない', async ({ page }) => {
        await expect(timeButton(page, '10:00')).toBeDisabled();
      });
      test('キャンセル済み（11時）の時間は押せる', async ({ page }) => {
        await expect(timeButton(page, '11:00')).toBeEnabled();
      });
    });
    test.describe('時間の選択', () => {
      test('時間を押すと選択中になる', async ({ page }) => {
        await timeButton(page, '09:00').click();
        await timeButton(page, '14:00').click();
        await expect(timeButton(page, '14:00')).toHaveAttribute('aria-pressed', 'true');
        await expect(timeButton(page, '09:00')).toHaveAttribute('aria-pressed', 'false');
      });
    });
    test.describe('入力エラー', () => {
      test('時間選択せずに「予約を確認する」を押すとエラーが出る', async ({ page }) => {
        await page.getByRole('button', { name: '予約を確認する' }).click();
        await expect(page.getByText('受診時間を選択してください')).toBeVisible();
      });
      test('エラーが出た後に時間を選ぶとエラーが消える', async ({ page }) => {
        await page.getByRole('button', { name: '予約を確認する' }).click();
        await timeButton(page, '09:00').click();
        await expect(page.getByText('受診時間を選択してください')).toBeHidden();
      });
    });
    test.describe('画面遷移', () => {
      test('「予約を確認する」ボタンで次の画面に渡される', async ({ page }) => {
        await timeButton(page, '09:00').click();
        await page.getByRole('button', { name: '予約を確認する' }).click();
        expect(await getNavigationState(page)).toEqual({ ...locationState, time: '09:00' });
      });
      test('「戻る」で予約日登録画面に戻る', async ({ page }) => {
        await page.route('http://localhost:3001/reservations', (route) =>
          route.fulfill({ json: [] }),
        );
        await page.getByRole('button', { name: '戻る' }).click();
        await expect(page).toHaveURL('/reservations/new/date');
        expect(await getNavigationState(page)).toEqual({ patientId: '1' });
      });
    });
  });
  test.describe('データを表示できない時', () => {
    test('URLを直接開くとエラーが出て、「予約を確認する」ボタンが出ない', async ({ page }) => {
      await page.goto(PAGE_PATH);
      await expect(
        page.getByText('予約の情報がありません。患者登録からやり直してください'),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: '予約を確認する' })).toHaveCount(0);
    });
  });
});
