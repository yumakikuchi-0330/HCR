import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001/patients';
const registeredPatients = [
  {
    id: '1',
    name: '山田太郎',
    nameKana: 'ヤマダタロウ',
    birthDate: '1980-04-12',
    gender: '男性',
  },
];

test.describe('患者新規登録画面', () => {
  test.beforeEach(async({ page }) =>{
    await page.route(API_URL,async(route) => {
      if(route.request().method() === 'GET'){
        await route.fulfill({json: registeredPatients});
        return
      }
      await route.fulfill({ status: 201,json:{ id:'99',...route.request().postDataJSON()} });
    });
    await page.goto('/reservations/new');
  });
  // ① 画面が正しく表示されるか
  test('タイトルと基本情報の入力欄が表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '患者新規登録'})).toBeVisible();
    await expect(page.getByLabel('生年月日')).toBeVisible();
    await expect(page.getByLabel('氏名')).toBeVisible();
    await expect(page.getByText('生年月日と氏名を入力すると、登録済みの患者情報が表示されます'),).toBeVisible();
  });
  // ②何も入力しないで送信した時
  test('未入力で送信するとエラーメッセージが出る', async ({ page}) => {
    await page.getByRole('button', {name: '日付を選択する'}).click();
    await expect(page.getByText('生年月日を入力してください')).toBeVisible();
    await expect(page.getByText('氏名を入力してください')).toBeVisible();
    await expect(page.getByText('性別を選択してください')).toBeVisible();
  });
  // ③登録済みの患者情報を入力した場合
  test('登録済みの患者を入力すると性別が変更できなくなる',async({ page }) => {
    await page.getByLabel('生年月日').fill('1980-04-12');
    await page.getByLabel('氏名').fill('山田 太郎');
    await expect(page.getByRole('radio',{ name: '男性' })).toBeDisabled();
    await expect(page.getByRole('radio',{ name: '女性' })).toBeDisabled();
  });
  // ④新規の患者だった場合
  test('新しい患者を登録すると予約日選択画面に移動する',async({ page }) => {
    await page.getByLabel('生年月日').fill('2000-01-01');
    await page.getByLabel('氏名').fill('山田次郎');
    // exact: true → 「男性」と完全に一致する文字だけを探す
    await page.getByText('男性', { exact: true }).click();
    await page.getByLabel('フリガナ').fill('ヤマダジロウ');
    // waitForRequest: 「POST通信が飛ぶのを待つ」準備をしておく
    // ※ クリックの「前」に準備する（クリックした瞬間に通信が飛ぶため、後だと見逃す）
    const requestPromise = page.waitForRequest(
      (request) => request.url() === API_URL && request.method() === 'POST',
    );
    await page.getByRole('button', { name: '日付を選択する' }).click();
    const request = await requestPromise;
    // postDataJSON: 送られたデータの中身
    // toMatchObject: 書いた項目が含まれていればOK（他の項目があってもよい）
    expect(request.postDataJSON()).toMatchObject({
      name:'山田次郎',
      nameKana:'ヤマダジロウ',
      birthDate:'2000-01-01',
      gender:'男性'
    });
    // 登録後、日付選択画面のURLに移動したか確認する
    await expect(page).toHaveURL('/reservations/new/date')
  });
  // ⑤キャンセルボタンを押してホームに戻る
  test('登録キャンセルを押すとホームに戻る', async({ page }) => {
    await page.getByRole('button', { name: '登録キャンセル' }).click();
    await expect(page).toHaveURL('/');
  });
  // ⑥API情報の取得に失敗したとき
  test('患者データの取得に失敗するとエラーメッセージが出る', async ({ page }) => {
    // status: 500 → サーバーエラーが起きたことにする
    await page.route(API_URL, (route) => route.fulfill({ status: 500}));
    await page.goto('/reservations/new');
    await expect(page.getByText('患者データの取得に失敗しました')).toBeVisible();
  });
})