import { Box, Input, SimpleGrid, Textarea } from '@chakra-ui/react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import FormField from '../FormField';
import type { PatientFormValues } from '../../types/type';

type PatientDetailFieldsProps = {
  register: UseFormRegister<PatientFormValues>;
  errors: FieldErrors<PatientFormValues>;
};

// 患者情報の入力欄（フリガナ・健保・住所・既往歴・連絡事項）
export const PatientDetailFields = ({ register, errors }: PatientDetailFieldsProps) => (
  <SimpleGrid columns={2} gap="24px">
    <FormField label="フリガナ" isRequired errorMessage={errors.nameKana?.message}>
      <Input
        placeholder="ヤマダタロウ"
        {...register('nameKana', { required: 'フリガナを入力してください' })}
      />
    </FormField>
    <FormField label="健保">
      <Input placeholder="協会けんぽ" {...register('insurance')} />
    </FormField>
    <FormField label="住所">
      <Input placeholder="東京都新宿区西新宿1-1-1" {...register('address')} />
    </FormField>
    <FormField label="既往歴">
      <Input {...register('medicalHistory')} />
    </FormField>
    <Box gridColumn="1 / -1">
      <FormField label="連絡事項">
        <Textarea {...register('note')} />
      </FormField>
    </Box>
  </SimpleGrid>
);

export default PatientDetailFields;
