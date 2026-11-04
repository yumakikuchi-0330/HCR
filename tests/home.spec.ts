import { test, expect } from '@playwright/test';

// 患者一覧のAPI（URLが毎回同じなので文字列で指定）
const PATIENTS_URL = 'http://localhost:3001/patients';
// 予約一覧のAPI（?date=2026-10-29 のように日付が毎回変わるので「正規表現」で指定）
// /.../ で囲むと「この形を含むURL」という意味になる。? は特別な記号なので \? と書く
const RESERVATIONS_URL = /\/reservations\?date=/;

// テスト用の患者データ
const patients = [
  { id: 'p1', name: '山田太郎', nameKana: 'ヤマダタロウ', birthDate: '1980-04-12', gender: '男性' },
  { id: 'p2', name: '佐藤花子', nameKana: 'サトウハナコ', birthDate: '1985-07-23', gender: '女性' },
];

// テスト用の予約データ
// わざと 10:00 → 09:00 の順に並べておく（画面で時間順に並び替えられるかを確かめるため）
const reservations = [
  { id: 'r1', patientId: 'p1', courseId: 'dock', date: '2026-10-29', time: '10:00', options: [{ optionId: 1, optionName: '胃カメラ' }], status: 'before' },
  { id: 'r2', patientId: 'p2', courseId: 'regular', date: '2026-10-29', time: '09:00', options: [], status: 'complete' },
  // 別の日（10/30）の予約。カレンダーで日付を切り替えるテストで使う
  { id: 'r3', patientId: 'p2', courseId: 'lifestyle', date: '2026-10-30', time: '11:00', options: [], status: 'inProgress' },
];

test.describe('ホーム画面', () => {
  test.beforeEach(async ({ page }) => {
    // page.clock.setFixedTime: ブラウザの「今日」を固定する
    // ホーム画面は最初に「今日」の予約を表示するので、日付を固定しないと実行する日によって結果が変わってしまう
    await page.clock.setFixedTime(new Date('2026-10-29T10:00:00'));
    // 患者一覧を取得されたら、テスト用の患者データを返す
    await page.route(PATIENTS_URL, (route) => route.fulfill({ json: patients }));
    // 予約一覧を取得されたら、URLの日付に合う予約だけを返す（本物のサーバーと同じ動き）
    await page.route(RESERVATIONS_URL, (route) => {
      // new URL(...).searchParams.get('date'): URLの「?date=」の後ろの値を取り出す
      const date = new URL(route.request().url()).searchParams.get('date');
      // filter: その日付の予約だけに絞り込む
      route.fulfill({ json: reservations.filter((r) => r.date === date) });
    });
    // ※ page.goto は各テストの中で書く
    //   （テストごとに別のモックを追加してから画面を開きたいため）
  });
  // ① 画面が正しく表示されるか
  test('見出しと今日の日付が表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '予約一覧' })).toBeVisible();
    // 固定した「今日」の日付が表示されているか
    await expect(page.getByText('2026年10月29日(木)')).toBeVisible();
  });
  // ② 予約の表
  test('その日の予約が時間順に表で表示される', async ({ page }) => {
    await page.goto('/');
    // getByRole('table'): 表を探す → その中の行（row）を全部取る
    const rows = page.getByRole('table').getByRole('row');
    // toHaveCount: 行の数を確認する（見出しの行1つ + 予約2件 = 3）
    await expect(rows).toHaveCount(3);
    // nth(1): 2番目の行（0から数えるので、0は見出しの行）
    // toContainText: その行の中に、この文字が含まれているか
    await expect(rows.nth(1)).toContainText('09:00');
    await expect(rows.nth(1)).toContainText('佐藤花子');
    await expect(rows.nth(1)).toContainText('定期健診'); // courseId: 'regular' がコース名に変換されているか
    await expect(rows.nth(1)).toContainText('—'); // オプションなしは「—」
    // 3番目の行には 10:00 の予約が入っているはず（時間順に並び替えられている）
    await expect(rows.nth(2)).toContainText('10:00');
    await expect(rows.nth(2)).toContainText('山田太郎');
    await expect(rows.nth(2)).toContainText('胃カメラ');
  });
  // ③ カレンダーで日付を切り替える
  test('カレンダーで日付を選ぶとその日の予約に切り替わる', async ({ page }) => {
    await page.goto('/');
    // カレンダーの日付マスには data-date="2026-10-30" という目印が付いている
    // locator('[data-date="..."]'): その目印を持つ要素を探す（CSSセレクタという書き方）
    await page.locator('[data-date="2026-10-30"]').click();
    // カレンダー横の日付表示が変わったか
    await expect(page.getByText('2026年10月30日(金)')).toBeVisible();
    // 10/30 の予約（生活習慣病）が表示されているか
    await expect(page.getByRole('table')).toContainText('生活習慣病');
    // not: 「〜ではない」を確かめる。10/29 の予約が表に残っていないか
    await expect(page.getByRole('table')).not.toContainText('山田太郎');
  });
  // ④ ページ切り替え（1ページ5件まで）
  test('予約が6件以上あるとページを切り替えられる', async ({ page }) => {
    // Array.from: 予約データを6件まとめて作る（09:00, 10:00, ... 14:00）
    const manyReservations = Array.from({ length: 6 }, (_, i) => ({
      id: `m${i + 1}`,
      patientId: 'p1',
      courseId: 'dock',
      date: '2026-10-29',
      // padStart(2, '0'): 9 → "09" のように2桁にそろえる
      time: `${String(9 + i).padStart(2, '0')}:00`,
      options: [],
      status: 'before',
    }));
    // beforeEach のモックより「後から登録したもの」が優先される
    await page.route(RESERVATIONS_URL, (route) => route.fulfill({ json: manyReservations }));
    await page.goto('/');
    const rows = page.getByRole('table').getByRole('row');
    // 1ページ目：見出し1行 + 予約5件 = 6
    await expect(rows).toHaveCount(6);
    // 1ページ目なので「<」（前へ）ボタンは押せない
    await expect(page.getByRole('button', { name: '<' })).toBeDisabled();
    // exact: true → 名前が「2」ぴったりのボタンだけ（「12」などに当たらないように）
    await page.getByRole('button', { name: '2', exact: true }).click();
    // 2ページ目：見出し1行 + 残り1件 = 2
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(1)).toContainText('14:00');
    // 最後のページなので「>」（次へ）ボタンは押せない
    await expect(page.getByRole('button', { name: '>' })).toBeDisabled();
  });
  // ⑤ 予約が0件のとき
  test('予約が0件のときメッセージが出る', async ({ page }) => {
    // 空っぽの配列を返す
    await page.route(RESERVATIONS_URL, (route) => route.fulfill({ json: [] }));
    await page.goto('/');
    await expect(page.getByText('この日の予約はありません')).toBeVisible();
  });
  // ⑥ APIが失敗したとき
  test('予約の取得に失敗するとエラーメッセージが出る', async ({ page }) => {
    // status: 500 → サーバーエラーが起きたことにする
    await page.route(RESERVATIONS_URL, (route) => route.fulfill({ status: 500 }));
    await page.goto('/');
    await expect(page.getByText('予約データの取得に失敗しました')).toBeVisible();
  });
  // ⑦ 新規予約ボタン
  test('新規予約ボタンを押すと患者新規登録画面に移動する', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '新規予約' }).click();
    await expect(page).toHaveURL('/reservations/new');
  });
  // ⑧ 詳細ボタン
  test('詳細ボタンを押すと予約詳細のURLに移動する', async ({ page }) => {
    await page.goto('/');
    // 「詳細」ボタンは行の数だけあるので、まず「山田太郎」の行に絞り込む
    // name: /山田太郎/ → 行の中に「山田太郎」を含む行（正規表現なので部分一致）
    const row = page.getByRole('row', { name: /山田太郎/ });
    // 絞り込んだ行の中の「詳細」ボタンをクリックする
    await row.getByRole('button', { name: '詳細' }).click();
    // 山田太郎の予約（id: r1）の詳細URLに移動したか
    await expect(page).toHaveURL('/reservations/r1');
  });
});