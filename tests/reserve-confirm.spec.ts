import { test, expect, type Page } from '@playwright/test';

const PAGE_PATH = '/reservations/new/confirm';
const DATE = '2026-11-24';
const TIME = '09:00';
const PATIENT_URL = 'http://localhost:3001/patients/1';
const RESERVATIONS_URL = 'http://localhost:3001/reservations';

// テスト用の患者データ
const patient = {
  id: '1',
  name: '山田太郎',
  nameKana: 'ヤマダタロウ',
  birthDate: '1980-04-12',
  gender: '男性',
};

const BASE_QUERY = `patientId=1&courseId=dock&date=${DATE}&options=1&options=2`;
const QUERY = `${BASE_QUERY}&time=${TIME}`;

const openWithQuery = async (page: Page, query = QUERY) => {
  await page.goto(`${PAGE_PATH}?${query}`);
};

const routeApis = async (page: Page) => {
  await page.route(PATIENT_URL, (route) => route.fulfill({ json: patient }));
};

const confirmButton = (page: Page) => page.getByRole('button', { name: '予約を確定する' });
const row = (page: Page, label: string) =>
  page.locator('.reserve-confirm_row').filter({ hasText: label });

test.describe('予約確認画面', () => {
  test.beforeEach(async ({ page }) => {
    await routeApis(page);
  });
  test.describe('前の画面から遷移してきた時', () => {
    test.beforeEach(async ({ page }) => {
      await openWithQuery(page);
    });
    test.describe('画面の表示', () => {
      test('見出しが表示される', async ({ page }) => {
        await expect(page.getByRole('heading', { name: '予約内容の確認' })).toBeVisible();
      });
      test('ステッパーが予約完了', async ({ page }) => {
        await expect(page.locator('[aria-current="step"]')).toHaveText('3.予約完了');
      });
      test('患者名とフリガナが表示される', async ({ page }) => {
        await expect(row(page, '患者')).toContainText('山田太郎');
        await expect(row(page, '患者')).toContainText('ヤマダタロウ');
      });
      test('健診コース名が表示される', async ({ page }) => {
        await expect(row(page, '健診内容')).toContainText('人間ドック');
      });
      test('受診日時が「2026年11月24日 09:00」で表示される', async ({ page }) => {
        await expect(row(page, '受診日時')).toContainText('2026年11月24日 09:00');
      });
      test('選んだ複数オプションが表示される', async ({ page }) => {
        await expect(row(page, 'オプション')).toContainText('胃カメラ、腹部エコー');
      });
    });
    test.describe('予約の確定', () => {
      test('「予約を確定する」で予約が登録され、予約完了画面に遷移する', async ({ page }) => {
        let requestBody: unknown;
        await page.route(RESERVATIONS_URL, async (route) => {
          requestBody = route.request().postDataJSON();
          await route.fulfill({ json: { id: '10' } });
        });
        await confirmButton(page).click();
        await expect(page).toHaveURL('/reservations/new/complete?reservationId=10');
        expect(requestBody).toEqual({
          patientId: '1',
          courseId: 'dock',
          date: DATE,
          time: TIME,
          options: [
            { optionId: 1, optionName: '胃カメラ' },
            { optionId: 2, optionName: '腹部エコー' },
          ],
          status: 'before',
        });
      });
      test('登録に失敗するとエラーが出て画面はそのまま', async ({ page }) => {
        await page.route(RESERVATIONS_URL, (route) => route.fulfill({ status: 500 }));
        await confirmButton(page).click();
        await expect(
          page.getByText('予約の登録に失敗しました。もう一度お試しください'),
        ).toBeVisible();
        await expect(page).toHaveURL(`${PAGE_PATH}?${QUERY}`);
        await expect(confirmButton(page)).toBeVisible();
      });
    });
    test.describe('画面遷移', () => {
      test('「戻る」ボタンで時間選択画面に戻り、timeが外れる', async ({ page }) => {
        await page.route(
          (url) => url.href === `${RESERVATIONS_URL}?date=${DATE}`,
          (route) => route.fulfill({ json: [] }),
        );
        await page.getByRole('button', { name: '戻る' }).click();
        await expect(page).toHaveURL(`/reservations/new/time?${BASE_QUERY}`);
      });
    });
  });
  test.describe('オプションを選択しなかった時', () => {
    test('オプション欄に「無し」と表示される', async ({ page }) => {
      await openWithQuery(page, `patientId=1&courseId=dock&date=${DATE}&time=${TIME}`);
      await expect(row(page, 'オプション')).toContainText('無し');
    });
    test('患者の取得に失敗するとエラーが出て、「予約を確定する」ボタンが出ない', async ({
      page,
    }) => {
      await page.route(PATIENT_URL, (route) => route.fulfill({ status: 500 }));
      await openWithQuery(page);
      await expect(page.getByText('データの取得に失敗しました')).toBeVisible();
      await expect(confirmButton(page)).toHaveCount(0);
    });
  });
  test.describe('予約の情報が正しくない時', () => {
    const errorText = '予約の情報がありません。患者登録からやり直してください';
    test('timeが無いとエラーが出て、「予約を確定する」ボタンが出ない', async ({ page }) => {
      await openWithQuery(page, BASE_QUERY);
      await expect(page.getByText(errorText)).toBeVisible();
      await expect(confirmButton(page)).toHaveCount(0);
    });
    for (const invalidDate of ['abc', '2026-02-30']) {
      test(`日付が不正（${invalidDate}）だとエラーが出る`, async ({ page }) => {
        await openWithQuery(page, `patientId=1&courseId=dock&date=${invalidDate}&time=${TIME}`);
        await expect(page.getByText(errorText)).toBeVisible();
        await expect(confirmButton(page)).toHaveCount(0);
      });
    }
    test('「戻る」で患者登録画面に戻る', async ({ page }) => {
      await openWithQuery(page, BASE_QUERY);
      await page.getByRole('button', { name: '戻る' }).click();
      await expect(page).toHaveURL('/reservations/new');
    });
  });
});
