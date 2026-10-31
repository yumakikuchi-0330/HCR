// test: テストを1つ書くための関数 / expect: 結果を確かめるための関数
// Jestと名前は同じだが、こちらはPlaywright専用のもの
import { test, expect } from '@playwright/test';

// test.describe: 関連するテストをひとまとめにする（Jestの describe と同じ役割）
test.describe('ログイン画面', () => {
  // test.beforeEach: 各テストの前に毎回実行する準備
  // { page }: Playwrightが用意してくれる「ブラウザのタブ」
  test.beforeEach(async ({ page }) => {
    // ログイン画面を開く（baseURL の http://localhost:3000 が前に付く）
    await page.goto('/login');
  });

  // ① 画面が正しく表示されるか
  test('タイトルと入力欄が表示される', async ({ page }) => {
    // getByRole('heading'): 見出し（h1など）を探す。RTLの getByRole と同じ考え方
    // toBeVisible: 画面に見えている状態か確認する
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    // ラベル「ログインID」の入力欄が見えているか
    await expect(page.getByLabel('ログインID')).toBeVisible();
    // ラベル「パスワード」の入力欄が見えているか
    await expect(page.getByLabel('パスワード')).toBeVisible();
  });

  // ② 何も入力しないで送信したとき
  test('未入力でログインするとエラーメッセージが出る', async ({ page }) => {
    // click: 「ログイン」ボタンをクリックする
    await page.getByRole('button', { name: 'ログイン' }).click();
    // getByText: 表示されている文字で要素を探す
    await expect(page.getByText('ログインIDを入力してください')).toBeVisible();
    await expect(page.getByText('パスワードを入力してください')).toBeVisible();
  });

  // ③ 間違ったIDとパスワードのとき
  test('IDかパスワードが違うとエラーメッセージが出る', async ({ page }) => {
    // fill: 入力欄に文字を入力する（RTLの userEvent.type にあたる）
    await page.getByLabel('ログインID').fill('admin');
    // わざと間違ったパスワードを入力する
    await page.getByLabel('パスワード').fill('wrong');
    // ログインボタンをクリックする
    await page.getByRole('button', { name: 'ログイン' }).click();
    // ログイン失敗のメッセージが出ることを確認する
    await expect(page.getByText('ログインIDまたはパスワードが正しくありません')).toBeVisible();
  });

  // ④ 正しいIDとパスワードのとき
  test('正しいIDとパスワードでログインするとトップに移動する', async ({ page }) => {
    // 正しいログインIDを入力する
    await page.getByLabel('ログインID').fill('admin');
    // 正しいパスワードを入力する
    await page.getByLabel('パスワード').fill('password');
    // ログインボタンをクリックする
    await page.getByRole('button', { name: 'ログイン' }).click();
    // toHaveURL: ブラウザのURLが http://localhost:3000/ に変わったか確認する
    await expect(page).toHaveURL('/');
  });
});
