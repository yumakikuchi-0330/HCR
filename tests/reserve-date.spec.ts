import { test, expect, type Page } from '@playwright/test';

// 患者一覧の取得・患者登録のAPI
const PATIENTS_URL = 'http://localhost:3001/patients';
// テスト用の患者1人分を取得するAPI
const PATIENT_URL = 'http://localhost:3001/patients/p1';
// 予約一覧を取得するAPI
const RESERVATIONS_URL = 'http://localhost:3001/reservations';
// 予約日登録画面のURL
const RESERVE_DATE_PATH = '/reservations/new/date';
// 1日に予約できる枠の数
const SLOT_COUNT = 9;
// 90日先の境界を確認するときに、カレンダーを次の月へ進める回数
const RESERVATIONS_MONTH = 3;

const patient = {
  id: 'p1',
  name: '山田太郎',
  nameKana: 'ヤマダタロウ',
  birthDate: '1980-04-12',
  gender: '男性',
};

const createReservations = (date: string, count: number, status = 'before') =>
  Array.from({ length: count }, (_, index) => ({
    id: `${date}-${index}`,
    patientId: 'p1',
    courseId: 'dock',
    date,
    time: '09:00',
    options: [],
    status,
  }));
const routeReservations = (page: Page, reservations: object[]) =>
  page.route(RESERVATIONS_URL, (route) => route.fulfill({ json: reservations }));
const openReserveDate = async (page: Page) => {
  await page.goto('/reservations/new');
  await page.getByLabel('生年月日').fill(patient.birthDate);
  await page.getByLabel('氏名').fill(patient.name);
  await page.getByText(patient.gender, { exact: true }).click();
  await page.getByLabel('フリガナ').fill(patient.nameKana);
  await page.getByRole('button', { name: '日付を選択する' }).click();
  await expect(page).toHaveURL(RESERVE_DATE_PATH);
};
test.describe('予約日登録画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-05T10:00:00'));
    await page.route(PATIENTS_URL, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: [] });
        return;
      }
      await route.fulfill({ status: 201, json: patient });
    });
    await page.route(PATIENT_URL, (route) => route.fulfill({ json: patient }));
  });
  test.describe('画面の表示', () => {
    test.beforeEach(async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
    });
    test('予約者の情報が表示される', async ({ page }) => {
      await expect(page.getByText('山田太郎')).toBeVisible();
      await expect(page.getByText('ヤマダタロウ/1980年04月12日')).toBeVisible();
    });
    test('健診コースが3つ表示され、最初は未選択', async ({ page }) => {
      for (const courseName of ['人間ドック', '定期健診', '生活習慣病']) {
        await expect(page.getByRole('button', { name: courseName })).toHaveAttribute(
          'aria-pressed',
          'false',
        );
      }
    });
    test('ステッパーの「日付選択」が現在いるところ', async ({ page }) => {
      await expect(page.locator('[aria-current="step"]')).toHaveText('1.日付選択');
    });
    test('検査オプションが6つ表示され、最初は未選択', async ({ page }) => {
      for (const optionName of [
        '胃カメラ',
        '腹部エコー',
        '腫瘍マーカー',
        '乳がん検診',
        '大腸カメラ',
        '心臓エコー',
      ]) {
        await expect(page.getByRole('button', { name: optionName })).toHaveAttribute(
          'aria-pressed',
          'false',
        );
      }
    });
  });
  test.describe('コースと受診日の選択', () => {
    test.beforeEach(async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
    });
    test('コースを選び直すと、選ばれているコースが切り替わる', async ({ page }) => {
      const dock = page.getByRole('button', { name: '人間ドック' });
      const regular = page.getByRole('button', { name: '定期健診' });
      await dock.click();
      await expect(dock).toHaveAttribute('aria-pressed', 'true');
      await regular.click();
      await expect(regular).toHaveAttribute('aria-pressed', 'true');
      await expect(dock).toHaveAttribute('aria-pressed', 'false');
    });
    test('日付を選び直すと、選ばれている日が切り替わる', async ({ page }) => {
      const firstDate = page.locator('[data-date="2026-11-06"]');
      const secondDate = page.locator('[data-date="2026-11-09"]');
      await firstDate.click();
      await expect(firstDate).toHaveClass(/is-selected/);
      await secondDate.click();
      await expect(secondDate).toHaveClass(/is-selected/);
      await expect(firstDate).not.toHaveClass(/is-selected/);
    });
    test('コースも受診日も選ばないとエラーが出て進めない', async ({ page }) => {
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(page.getByText('健診コースと受診日を選択してください')).toBeVisible();
      await expect(page).toHaveURL(RESERVE_DATE_PATH);
    });
    test('受診日を選ばないとエラーが出て進めない', async ({ page }) => {
      await page.getByRole('button', { name: '人間ドック' }).click();
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(page.getByText('健診コースと受診日を選択してください')).toBeVisible();
      await expect(page).toHaveURL(RESERVE_DATE_PATH);
    });
    test('コースを選ばないとエラーが出て進めない', async ({ page }) => {
      await page.locator('[data-date="2026-11-06"]').click();
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(page.getByText('健診コースと受診日を選択してください')).toBeVisible();
      await expect(page).toHaveURL(RESERVE_DATE_PATH);
    });
    test('エラーが出たあとにコースや日付を選ぶとエラーが消える', async ({ page }) => {
      const errorText = page.getByText('健診コースと受診日を選択してください');
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(errorText).toBeVisible();
      await page.getByRole('button', { name: '人間ドック' }).click();
      await expect(errorText).toBeHidden();
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(errorText).toBeVisible();
      await page.locator('[data-date="2026-11-06"]').click();
      await expect(errorText).toBeHidden();
    });
    test('コースと受診日を選ぶと、選んだ内容を持って時間選択へ進む', async ({ page }) => {
      await page.getByRole('button', { name: '定期健診' }).click();
      await page.locator('[data-date="2026-11-06"]').click();
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(page).toHaveURL('/reservations/new/time');
      const state = await page.evaluate(() => window.history.state.usr);
      expect(state).toEqual({
        patientId: 'p1',
        courseId: 'regular',
        date: '2026-11-06',
        options: [],
      });
    });
    test('戻るを押すと患者新規登録画面に戻る', async ({ page }) => {
      await page.getByRole('button', { name: '戻る' }).click();
      await expect(page).toHaveURL('/reservations/new');
    });
  });
  test.describe('検査オプションの選択', () => {
    test.beforeEach(async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
    });
    test('オプションを押すと選択され、もう一度押すと解除される', async ({ page }) => {
      const gastro = page.getByRole('button', { name: '胃カメラ' });
      await gastro.click();
      await expect(gastro).toHaveAttribute('aria-pressed', 'true');
      await gastro.click();
      await expect(gastro).toHaveAttribute('aria-pressed', 'false');
    });
    test('オプションは複数選択できる', async ({ page }) => {
      const gastro = page.getByRole('button', { name: '胃カメラ' });
      const echo = page.getByRole('button', { name: '腹部エコー' });
      await gastro.click();
      await echo.click();
      await expect(gastro).toHaveAttribute('aria-pressed', 'true');
      await expect(echo).toHaveAttribute('aria-pressed', 'true');
    });
    test('オプションを選ばなくても時間選択へ進める', async ({ page }) => {
      await page.getByRole('button', { name: '人間ドック' }).click();
      await page.locator('[data-date="2026-11-06"]').click();
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(page).toHaveURL('/reservations/new/time');
    });
    test('選んだオプションを持って時間選択へ進む', async ({ page }) => {
      await page.getByRole('button', { name: '人間ドック' }).click();
      await page.locator('[data-date="2026-11-06"]').click();
      await page.getByRole('button', { name: '胃カメラ' }).click();
      await page.getByRole('button', { name: '大腸カメラ' }).click();
      await page.getByRole('button', { name: '時間を選択する' }).click();
      await expect(page).toHaveURL('/reservations/new/time');
      const state = await page.evaluate(() => window.history.state.usr);
      expect(state).toEqual({
        patientId: 'p1',
        courseId: 'dock',
        date: '2026-11-06',
        options: [
          { optionId: 1, optionName: '胃カメラ' },
          { optionId: 5, optionName: '大腸カメラ' },
        ],
      });
    });
  });
  test.describe('選べる日と選べない日', () => {
    const expectUnavailable = async (page: Page, date: string) => {
      const dateCell = page.locator(`[data-date="${date}"]`);
      await expect(dateCell).toHaveClass(/is-unavailable/);
      await dateCell.click();
      await expect(dateCell).not.toHaveClass(/is-selected/);
    };
    test('今日は選べて、昨日は選べない', async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
      await expect(page.locator('[data-date="2026-11-05"]')).not.toHaveClass(/is-unavailable/);
      await expectUnavailable(page, '2026-11-04');
    });
    test('予約枠がすべて埋まった日は選べない', async ({ page }) => {
      await routeReservations(page, createReservations('2026-11-06', SLOT_COUNT));
      await openReserveDate(page);
      await expectUnavailable(page, '2026-11-06');
    });
    test('予約枠が1つでも残っている日は選べる', async ({ page }) => {
      await routeReservations(page, createReservations('2026-11-06', SLOT_COUNT - 1));
      await openReserveDate(page);
      await expect(page.locator('[data-date="2026-11-06"]')).not.toHaveClass(/is-unavailable/);
    });
    test('キャンセルされた予約は予約枠の数に含めない', async ({ page }) => {
      await routeReservations(page, [
        ...createReservations('2026-11-06', SLOT_COUNT - 1),
        ...createReservations('2026-11-07', 1, 'cancel').map((reservation) => ({
          ...reservation,
          date: '2026-11-06',
        })),
      ]);
      await openReserveDate(page);
      await expect(page.locator('[data-date="2026-11-06"]')).not.toHaveClass(/is-unavailable/);
    });
    test('今日を含めて90日間は選べて、それより先は選べない', async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
      for (let i = 0; i < RESERVATIONS_MONTH; i += 1) {
        await page.locator('.fc-next-button').click();
      }
      await expect(page.locator('[data-date="2027-02-02"]')).not.toHaveClass(/is-unavailable/);
      await expectUnavailable(page, '2027-02-03');
    });
    test('祝日は赤字で表示され、選べない', async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
      const holiday = page.locator('[data-date="2026-11-23"]');
      await expect(holiday).toHaveClass(/is-holiday/);
      await expect(holiday.locator('.fc-daygrid-day-number')).toHaveCSS(
        'color',
        //  #c62828
        'rgb(198, 40, 40)',
      );
      await expectUnavailable(page, '2026-11-23');
    });
    test('土日は赤字で表示され、選べない', async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
      // 2026-11-07 は土曜、2026-11-08 は日曜
      for (const date of ['2026-11-07', '2026-11-08']) {
        await expect(page.locator(`[data-date="${date}"] .fc-daygrid-day-number`)).toHaveCSS(
          'color',
          //  #c62828
          'rgb(198, 40, 40)',
        );
        await expectUnavailable(page, date);
      }
    });
    test('祝日ではない日は祝日の表示にならず、選べる', async ({ page }) => {
      await routeReservations(page, []);
      await openReserveDate(page);
      const weekday = page.locator('[data-date="2026-11-24"]');
      await expect(weekday).not.toHaveClass(/is-holiday/);
      await expect(weekday).not.toHaveClass(/is-unavailable/);
    });
  });
  test.describe('データを表示できないとき', () => {
    test('URLを直接開くとエラーが出て、戻るボタンだけ表示される', async ({ page }) => {
      await routeReservations(page, []);
      await page.goto(RESERVE_DATE_PATH);
      await expect(
        page.getByText('予約の情報がありません。患者登録からやり直してください'),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: '時間を選択する' })).toHaveCount(0);
      await expect(page.locator('.calendar')).toHaveCount(0);
      await expect(page.getByRole('button', { name: '戻る' })).toBeVisible();
    });
    test('患者の取得に失敗するとエラーが出る', async ({ page }) => {
      await routeReservations(page, []);
      await page.route(PATIENT_URL, (route) => route.fulfill({ status: 500 }));
      await openReserveDate(page);
      await expect(page.getByText('データの取得に失敗しました')).toBeVisible();
      await expect(page.getByRole('button', { name: '時間を選択する' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: '戻る' })).toBeVisible();
    });
    test('予約一覧の取得に失敗するとエラーが出る', async ({ page }) => {
      await page.route(RESERVATIONS_URL, (route) => route.fulfill({ status: 500 }));
      await openReserveDate(page);
      await expect(page.getByText('データの取得に失敗しました')).toBeVisible();
      await expect(page.locator('.calendar')).toHaveCount(0);
    });
  });
});
