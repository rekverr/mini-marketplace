import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "../../frontend/src/components/ui/Pagination";
const meta = { title: "UI/Pagination", component: Pagination } satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { currentPage: 2, totalPages: 5, onPageChange: () => undefined } };
