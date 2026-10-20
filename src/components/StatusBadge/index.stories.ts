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
    statusId: 'before',
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const Before: Story = { args: { statusId: 'before' } };
export const InProgress: Story = { args: { statusId: 'inProgress' } };
export const Complete: Story = { args: { statusId: 'complete' } };
export const Cancel: Story = { args: { statusId: 'cancel' } };