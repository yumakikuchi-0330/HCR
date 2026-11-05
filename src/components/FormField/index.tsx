import type { ReactNode } from 'react';
import { Field, Text } from '@chakra-ui/react';

// 「必須」のラベル
export const RequiredMark = () => (
  <Text as="span" fontSize="12px" fontWeight="bold" color="#c62828" bg="#fdecea" px="4px">
    必須
  </Text>
);

type FormFieldProps = {
  label: string;
  isRequired?: boolean;
  errorMessage?: string;
  children: ReactNode;
};

// ラベル・入力欄・エラーをまとめた入力項目
export const FormField = ({ label, isRequired = false, errorMessage, children }: FormFieldProps) => (
  <Field.Root invalid={!!errorMessage}>
    <Field.Label fontSize="label" fontWeight="bold" gap="8px">
      {label}
      {isRequired && <RequiredMark />}
    </Field.Label>
    {children}
    <Field.ErrorText>{errorMessage}</Field.ErrorText>
  </Field.Root>
);

export default FormField;
