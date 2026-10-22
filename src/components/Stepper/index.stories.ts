import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Stepper } from '.';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    steps: ['日付選択', '時間選択', '予約完了'],
    currentStep: 0,
  },
} satisfies Meta<typeof Stepper>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const DateSelect: Story = { args: { currentStep: 0 } };
export const TimeSelect: Story = { args: { currentStep: 1 } };
export const Complete:   Story = { args: { currentStep: 2 } };