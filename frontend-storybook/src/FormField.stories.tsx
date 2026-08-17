import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "../../frontend/src/components/ui/FormField";
const meta = { title: "UI/FormField", component: FormField } satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { label: "Email", children: <input className="rounded border p-2" placeholder="you@example.com" /> } };
