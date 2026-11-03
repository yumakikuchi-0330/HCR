import { test, expect, type Page } from '@playwright/test';

// 患者1人分のAPI（編集画面はGETで取得、PUTで保存の両方にこのURLを使う）
const PATIENT_URL = 'http://localhost:3001/patients/1';

// テスト用の登録済み患者データ
const patient = {
  id: '1',
  name: '山田太郎',
  nameKana: 'ヤマダタロウ',
  birthDate: '1980-04-12',
  gender: '男性',
  insurance: '協会けんぽ',
  address: '東京都新宿区西新宿1-1-1',
  note: '前回、血圧高め',
  lastVisit: { status: 'complete', date: '2025-04-15' },
};

test.describe('患者編集画面', () => {
  test.beforeEach(async({ page }) => {
    await page.route(PATIENT_URL,async(route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ json: patient });
        return
      }
      await route.fulfill({ json: { id:'1',...route.request().postDataJSON()} });
    });
  });
  // ① 開いたときに、今の患者情報がフォームに入っているか
  test('登録されている患者情報がフォームに入っている', async ({ page }) => {
    // URLの「1」が患者ID（/patients/:id/edit の :id）
    await page.goto('/patients/1/edit');
    await expect(page.getByRole('heading', { name: '患者情報編集' })).toBeVisible();
    // toHaveValue: 入力欄に入っている値を確認する（toBeVisible は「見えるか」だけ）
    await expect(page.getByLabel('生年月日')).toHaveValue('1980-04-12');
    await expect(page.getByLabel('氏名')).toHaveValue('山田太郎');
    // toBeChecked: ラジオボタンやチェックボックスが選ばれているか
    await expect(page.getByRole('radio', { name: '男性' })).toBeChecked();
    await expect(page.getByLabel('フリガナ')).toHaveValue('ヤマダタロウ');
    await expect(page.getByLabel('健保')).toHaveValue('協会けんぽ');
    // データにない項目は空欄になっているか（画面側で '' にそろえている）
    await expect(page.getByLabel('既往歴')).toHaveValue('');
    await expect(page.getByLabel('連絡事項')).toHaveValue('前回、血圧高め');
  });
  // ② 必須項目を消して保存したとき
  test('必須項目を空にして保存するとエラーが出て保存されない', async ({ page }) => {
    // 保存（PUT）の通信が飛んだかどうかを記録しておく
    let isSaved = false;
    page.on('request', (request) => {
      if (request.method() === 'PUT') isSaved = true;
    });
    await page.goto('/patients/1/edit');
    // clear: 入力欄の中身を消す
    await page.getByLabel('氏名').clear();
    await page.getByLabel('フリガナ').clear();
    await page.getByRole('button', { name: '保存する' }).click();
    await expect(page.getByText('氏名を入力してください')).toBeVisible();
    await expect(page.getByText('フリガナを入力してください')).toBeVisible();
    // toBe(false): 保存の通信が1回も飛んでいないこと
    expect(isSaved).toBe(false);
    await expect(page).toHaveURL('/patients/1/edit');
  });
  // ③ 編集して保存したとき
  test('内容を変更して保存すると詳細画面に戻る', async ({ page }) => {
    await page.goto('/patients/1/edit');
    // fill: 中身を消してから新しく入力する（clear してから入力するのと同じ）
    await page.getByLabel('住所').fill('大阪府大阪市北区1-1');
    // 性別を男性 → 女性に変える
    await page.getByText('女性', { exact: true }).click();
    // クリックの「前」に、PUT通信を待つ準備をしておく
    const requestPromise = page.waitForRequest(
      (request) => request.url() === PATIENT_URL && request.method() === 'PUT',
    );
    await page.getByRole('button', { name: '保存する' }).click();
    const request = await requestPromise;
    // toEqual: 送られたデータが「ぴったり同じ」か（toMatchObject と違い、余分な項目があると失敗）
    expect(request.postDataJSON()).toEqual({
      name: '山田太郎',
      nameKana: 'ヤマダタロウ',
      birthDate: '1980-04-12',
      gender: '女性',
      insurance: '協会けんぽ',
      address: '大阪府大阪市北区1-1',
      medicalHistory: '',
      note: '前回、血圧高め',
      // PUTで消えないよう、フォームにない前回受診もそのまま送られている
      lastVisit: { status: 'complete', date: '2025-04-15' },
    });
    // 保存後は患者詳細画面に戻る
    await expect(page).toHaveURL('/patients/1');
  });
  // ④ 保存に失敗したとき
  test('保存に失敗するとエラーが出て編集画面に残る', async ({ page }) => {
    // beforeEach のモックの上に、「PUTだけ失敗させる」モックを追加する
    await page.route(PATIENT_URL, async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 500 });
        return;
      }
      // fallback: このモックでは何もせず、前に登録したモック（beforeEach）に任せる
      await route.fallback();
    });
    await page.goto('/patients/1/edit');
    await page.getByRole('button', { name: '保存する' }).click();
    await expect(page.getByText('患者情報の更新に失敗しました')).toBeVisible();
    // 失敗したので画面は移動しない
    await expect(page).toHaveURL('/patients/1/edit');
    // 入力した内容が消えずに残っている（もう一度保存し直せる）
    await expect(page.getByLabel('氏名')).toHaveValue('山田太郎');
  });
  // ⑤ 編集キャンセル
  test('編集キャンセルを押すと保存せずに詳細画面に戻る', async ({ page }) => {
    await page.goto('/patients/1/edit');
    await page.getByLabel('住所').fill('変更したけど保存しない住所');
    await page.getByRole('button', { name: '編集キャンセル' }).click();
    await expect(page).toHaveURL('/patients/1');
    // 詳細画面には元の住所が表示されている（保存されていない）
    await expect(page.getByText('東京都新宿区西新宿1-1-1')).toBeVisible();
  });
});
// ⑥ 取得に失敗したとき（成功するモックを使いたくないので describe の外に書く）
test('患者データの取得に失敗するとフォームが表示されない', async ({ page }) => {
  await page.route(PATIENT_URL, (route) => route.fulfill({ status: 500 }));
  await page.goto('/patients/1/edit');
  await expect(page.getByText('患者データの取得に失敗しました')).toBeVisible();
  // toHaveCount(0): 画面に1つもないこと（空のまま保存できないようになっているか）
  await expect(page.getByRole('button', { name: '保存する' })).toHaveCount(0);
  await expect(page.getByLabel('氏名')).toHaveCount(0);
})

test.describe('前回受診日の表示', () => {
  // 患者情報（山田太郎）に、テストごとの lastVisit を付けて返す
  const routePatient = (page: Page, lastVisit?: object) =>
    page.route(PATIENT_URL, (route) => route.fulfill({ json: { ...patient, lastVisit } }));
  // ⑦ 受診歴がある人
  test('受診歴があると前回受診日が表示される', async ({ page }) => {
    await routePatient(page, { status: 'complete', date: '2025-04-15' });
    await page.goto('/patients/1/edit');
    // 登録されている情報はそのままフォームに入っている
    await expect(page.getByLabel('氏名')).toHaveValue('山田太郎');
    await expect(page.getByText('前回受診日：2025年04月15日', { exact: true })).toBeVisible();
  });
  // ⑧ 受診歴がなく、キャンセルした人
  test('受診歴がなくキャンセルがあるとキャンセル日が表示される', async ({ page }) => {
    await routePatient(page, { status: 'cancel', date: '2026-10-23' });
    await page.goto('/patients/1/edit');
    await expect(
      page.getByText('前回受診日：2026年10月23日キャンセルで未受診', { exact: true }),
    ).toBeVisible();
  });
  // ⑨ 受診歴もキャンセルもない人
  test('受診前・受診中の予約しかないと未受診と表示される', async ({ page }) => {
    await routePatient(page, { status: 'reserved' });
    await page.goto('/patients/1/edit');
    await expect(page.getByText('前回受診日：未受診', { exact: true })).toBeVisible();
    // 予約はあるので初診ではない → 登録されている情報がフォームに入っている
    await expect(page.getByLabel('氏名')).toHaveValue('山田太郎');
  });
  // ⑩ 予約が1件もない人（初診）
  test('初診と表示され、登録されている情報がフォームに入っている', async ({ page }) => {
    await routePatient(page, { status: 'firstVisit' });
    await page.goto('/patients/1/edit');
    await expect(page.getByText('前回受診日：初診', { exact: true })).toBeVisible();
    await expect(page.getByLabel('生年月日')).toHaveValue('1980-04-12');
    await expect(page.getByLabel('氏名')).toHaveValue('山田太郎');
    await expect(page.getByRole('radio', { name: '男性' })).toBeChecked();
    await expect(page.getByLabel('フリガナ')).toHaveValue('ヤマダタロウ');
    await expect(page.getByLabel('健保')).toHaveValue('協会けんぽ');
    await expect(page.getByLabel('住所')).toHaveValue('東京都新宿区西新宿1-1-1');
    await expect(page.getByLabel('連絡事項')).toHaveValue('前回、血圧高め');
  });
  // ⑪ 前回受診の情報がないとき
  test('前回受診の情報がないと前回受診日は表示されない', async ({ page }) => {
    await routePatient(page);
    await page.goto('/patients/1/edit');
    // フォームは表示されていて、保存ボタンもある（編集はできる）
    await expect(page.getByLabel('氏名')).toHaveValue('山田太郎');
    await expect(page.getByRole('button', { name: '保存する' })).toBeVisible();
    await expect(page.getByText(/前回受診日/)).toHaveCount(0);
  });
});
