const apiUrl = process.env.REACT_APP_API_URL;

const commonUrl = (path: string) => `${apiUrl}${path}`;
// URL の組み立て、失敗時の例外、res.json() まで
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
};
// GET通信でデータの取得
export const get = async (path: string) => {
  const res = await fetch(commonUrl(path));
  return handleResponse(res);
};
// POST・PUTで共通の送信処理
const send = async (method: 'POST' | 'PUT', path: string, body: unknown) => {
  const res = await fetch(commonUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
};
// データの新規作成
export const post = (path: string, body: unknown) => send('POST', path, body);
// データの書き換え
export const put = (path: string, body: unknown) => send('PUT', path, body);