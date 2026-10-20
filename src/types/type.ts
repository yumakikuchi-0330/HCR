// ログインフォームの入力値
export type LoginFormValues = {
  loginId: string;
  password: string;
};

// 正しい値以外のときエラーになる
export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;