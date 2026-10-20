import { useState } from "react";
import LoginForm from '../../components/LoginForm/LoginForm';
import type { LoginFormValues } from '../../types/type';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const handleLogin = (values: LoginFormValues) => {
    // APIができたら'/'部分を置き換える
    if (values.loginId === 'admin' && values.password === 'password') {
      navigate('/');
    } else {
      setErrorMessage('ログインIDまたはパスワードが正しくありません');
    }
  };

  return (
    <div className="login">
      <div className="login_card">
        <p>健診予約システム</p>
        <h1 className="login__title">ログイン</h1>
        <LoginForm onSubmit={handleLogin} errorMessage={errorMessage} />
      </div>
    </div>
  );
};

export default Login;