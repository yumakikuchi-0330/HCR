import type { Meta, StoryObj } from '@storybook/react-webpack5';
import  {Button} from './button';

const meta = {
  title: 'Components/Button',
  component: Button,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    text: "ボタン"
  },
} satisfies Meta<typeof Button>;

export default meta;
export type Story = StoryObj<typeof meta>;
export const Small: Story = { args: { size: 'small' } };
export const Medium: Story = { args: { size: 'medium' } };
export const Large: Story = { args: { size: 'large' } };
