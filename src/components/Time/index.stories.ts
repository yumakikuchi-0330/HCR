import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fn } from 'storybook/test';
import  { Time } from '.';
import { TIME_SLOTS } from '../../types/type';

const meta = {
  title: 'Components/Time',
  component: Time,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    slots: TIME_SLOTS,
    selectedTime: null,
    onSelect:fn(),
  },
} satisfies Meta<typeof Time>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const Selected: Story = { args: { selectedTime: '10:00' } };
export const Default: Story = {};
export const Reserved: Story = {
  args: {
    slots: TIME_SLOTS.map((slot) =>
      slot.time === '09:00'
        ? { ...slot, reservedBy: '山田太郎' }
        : slot
    ),
  },
};