const apiUrl = process.env.REACT_APP_API_URL;

const request = async (path: string, options?: RequestInit) => {
  // http://localhost:3001/patients
  const res = await fetch(`${apiUrl}${path}`, {
    // POST,PUT通信
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

// データの取得
export const get = (path: string) => request(path);
// データの上書き保存
export const post = (path: string, body: unknown) =>
  request(path, { method: 'POST', body: JSON.stringify(body) });
// データの書き換え
export const put = (path: string, body: unknown) =>
  request(path, { method: 'PUT', body: JSON.stringify(body) });