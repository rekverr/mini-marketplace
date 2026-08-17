import type { Meta, StoryObj } from "@storybook/react";
import { ProductCard } from "../../frontend/src/features/catalog/ProductCard";
import type { Product } from "../../frontend/src/entities/product/product.types";

const product: Product = { id: "p1", name: "Keyboard", description: "Mechanical keyboard", price: "49.99", stockQuantity: 12, categoryId: "c1", createdAt: new Date().toISOString() };
const meta = { title: "Catalog/ProductCard", component: ProductCard } satisfies Meta<typeof ProductCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { product } };
export const OutOfStock: Story = { args: { product: { ...product, stockQuantity: 0 } } };
