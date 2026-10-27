import { get, post, put } from './common';
import type { Patient } from '../types/management';
import type { PatientRequest } from '../types/api';

// 患者一覧を取得（全件取得したいから引数なし、Patientオブジェクトの配列を返す）
export const fetchPatients = (): Promise<Patient[]> => get('/patients');
// 患者を1件取得（idから取得、1件のPatientオブジェクトを返す）
export const fetchPatient = (id: string): Promise<Patient> => get(`/patients/${id}`);
// 患者を新規登録（入力された新規患者データ、POST通信を使ってdataを新規作成）
export const createPatient = (data: PatientRequest): Promise<Patient> =>
  post('/patients', data);
// 患者情報を更新（PUT通信で患者情報を書き換える）
export const updatePatient = (id: string, data: PatientRequest): Promise<Patient> =>
  put(`/patients/${id}`, data);
