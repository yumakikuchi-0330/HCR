import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { StatusBadge } from '.';

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    label: '受診前',
    situation: 'before'
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const Before: Story = { args: { label: '受診前' , situation: 'before'} ,};
export const InProgress: Story = { args: { label: '受診中' , situation:'inProgress' } };
export const Complete: Story = { args: { label: '受診済' , situation:'complete' } };
export const Cancel: Story = { args: { label: 'キャンセル' , situation:'cancel' } };