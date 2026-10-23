import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fn } from 'storybook/test';
import type { ChangeEvent } from 'react';
import  {Input} from '.';

const meta = {
  title: 'Components/Input',
  component: Input,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    value: '',
    onChange: fn(),
  },
} satisfies Meta<typeof Input>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const PatientName: Story = {
  args: { id: 'patientName', label: '名前', name: 'name', placeholder: '山田 太郎'},
};
export const BirthDate: Story = {
  args: { id: 'birthday', label: '生年月日', name: 'birthday', type: 'date'},
};
export const NameError: Story = {
  args: { id: 'patientName', label: '名前', name: 'name', errorMessage: '名前を入力してください' },
};