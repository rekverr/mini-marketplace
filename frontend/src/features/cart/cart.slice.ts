import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Cart, AddToCartPayload } from "../../entities/cart/cart.types";
import { cartService } from "../../api/cart.service";
import { getApiErrorMessage } from "../../lib/api-error";
import { logout } from "../auth/auth.slice";

interface CartState {
  data: Cart | null;
  loading: boolean;
  error: string | null;
  previousData: Cart | null;
}

const initialState: CartState = {
  data: null,
  loading: false,
  error: null,
  previousData: null,
};

export const fetchCart = createAsyncThunk("cart/fetch", async () => {
  return await cartService.getCart();
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async (payload: AddToCartPayload, { rejectWithValue }) => {
    try {
      const { productId, quantity } = payload;
      return await cartService.addItem({ productId, quantity });
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Error adding item"));
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/update",
  async (
    payload: { productId: string; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      return await cartService.updateItem(payload.productId, payload.quantity);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Error updating item"));
    }
  },
);

export const removeCartItem = createAsyncThunk(
  "cart/remove",
  async (productId: string, { rejectWithValue }) => {
    try {
      return await cartService.removeItem(productId);
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Error removing item"));
    }
  },
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState: (state) => {
      state.data = null;
      state.error = null;
      state.previousData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, (state) => {
        state.data = null;
        state.error = null;
        state.previousData = null;
      })
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(addToCart.pending, (state, action) => {
        state.previousData = state.data ? JSON.parse(JSON.stringify(state.data)) : null;
        const { productId, quantity, optimisticProduct } = action.meta.arg;
        if (!state.data) return;
        const existing = state.data.items.find((i) => i.productId === productId);
        if (existing) existing.quantity += quantity;
        else state.data.items.push({ id: `optimistic-${productId}`, cartId: state.data.id, productId, quantity, product: optimisticProduct });
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.data = action.payload;
        state.previousData = null;
        state.error = null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        if (state.previousData) state.data = state.previousData;
        state.previousData = null;
        state.error = action.payload as string;
      })
      .addCase(updateCartItem.pending, (state, action) => {
        state.previousData = state.data
          ? JSON.parse(JSON.stringify(state.data))
          : null;
        const { productId, quantity } = action.meta.arg;
        if (state.data) {
          const item = state.data.items.find((i) => i.productId === productId);
          if (item) item.quantity = quantity;
        }
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.data = action.payload;
        state.previousData = null;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        if (state.previousData) state.data = state.previousData;
        state.error = action.payload as string;
      })
      .addCase(removeCartItem.pending, (state, action) => {
        state.previousData = state.data
          ? JSON.parse(JSON.stringify(state.data))
          : null;
        const productId = action.meta.arg;
        if (state.data) {
          state.data.items = state.data.items.filter(
            (i) => i.productId !== productId,
          );
        }
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.data = action.payload;
        state.previousData = null;
        state.error = null;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        if (state.previousData) state.data = state.previousData;
        state.error = action.payload as string;
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
