import * as yup from 'yup';

export const patientSchema = yup.object({
  name: yup.string().trim().required('氏名を入力してください'),
  nameKana: yup.string().trim().required('フリガナを入力してください'),
  birthDate: yup.string().required('生年月日を入力してください'),
  gender: yup.string<'' | '男性' | '女性'>().required('性別を選択してください'),
  insurance: yup.string(),
  address: yup.string(),
  medicalHistory: yup.string(),
  note: yup.string(),
});