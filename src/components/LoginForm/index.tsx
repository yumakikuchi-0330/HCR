import { useForm } from 'react-hook-form';
import Input from '../Input';
import type { LoginFormValues } from '../../types/type';

type LoginProps = {
  onSubmit: (values: LoginFormValues) => void;
  errorMessage?: string;
}

const LoginForm = ({ onSubmit, errorMessage }: LoginProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    // ログインIDとパスワードの初期値は空文字
    defaultValues: { loginId: '', password: '' },
  });
  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="loginId"
        label="ログインID"
        {...register('loginId', { required: 'ログインIDを入力してください' })}
        errorMessage={errors.loginId?.message}
      />
      <Input
        id="password"
        label="パスワード"
        type="password"
        {...register('password', { required: 'パスワードを入力してください' })}
        errorMessage={errors.password?.message}
      />
      {errorMessage && <p>{errorMessage}</p>}
      <button type="submit">ログイン</button>
    </form>
  )
};

export default LoginForm;
