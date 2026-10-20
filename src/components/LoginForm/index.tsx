import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from 'react';
import type { LoginFormValues, LoginFormErrors } from '../../types/type';

type LoginProps = {
  onSubmit: (values: LoginFormValues) => void;
  errorMessage?: string;
}

// ログインIDとパスワードの初期値は空文字
const initialValues: LoginFormValues = { loginId: '' , password:'' };
// 未入力チェック
const validate = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};
  if(!values.loginId) errors.loginId = "ログインIDを入力してください";
  if(!values.password) errors.password = "パスワードを入力してください";
  return errors;
};
// ログインフォームの部品
const LoginForm = ({ onSubmit ,errorMessage }: LoginProps) => {
  const [ values, setValues ] = useState<LoginFormValues>(initialValues);
  const [ errors, setErrors ] = useState<LoginFormErrors>({});
  // 文字入力をリアルタイム判定
  const handleChange = ( e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues({ ...values,[name]: value });
  };
  const handleSubmit = ( e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);
    if(Object.keys(newErrors).length > 0) return;
    onSubmit(values);
  };
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="loginId">ログインID</label>
        <input
        id = "loginId"
        type="text"
        name="loginId"
        value={values.loginId}
        onChange={handleChange}
        />
        {errors.loginId && <p>{errors.loginId}</p>}
      </div>
      <div>
        <label htmlFor="password">パスワード</label>
        <input
        id = "password"
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        />
        {errors.password && <p>{errors.password}</p>}
      </div>
      {errorMessage && <p>{errorMessage}</p>}
      <button type="submit">ログイン</button>
    </form>
  )
};

export default LoginForm;
