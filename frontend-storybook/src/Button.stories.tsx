import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../frontend/src/components/ui/Button";
const meta = { title: "UI/Button", component: Button, args: { children: "Button" } } satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Disabled: Story = { args: { disabled: true } };
