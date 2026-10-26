import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Header } from '.';

const meta = {
  title: 'Layouts/Header',
  component: Header,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    title: 'HCR',
  },
} satisfies Meta<typeof Header>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const Default: Story = {};
