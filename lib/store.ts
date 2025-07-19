import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Product = {
  id: number;
  title: string;
  sku: string;
  image: string;
  price: number;
  description: string;
  stock: number;
};

// export type CartItem = Product & { qty: number };

interface ProductState {
  products: Product[];
  setProducts: (prods: Product[]) => void;
  cart: CartItem[];
  addToCart: (prod: Product) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  setProducts: (products) => set({ products }),
  cart: [],
  addToCart(prod) {
    const cart = get().cart;
    const exist = cart.find((item) => item.id === prod.id);
    if (exist) {
      set({
        cart: cart.map((item) =>
          item.id === prod.id ? { ...item, qty: item.qty + 1 } : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...prod, qty: 1 }] });
    }
  },
  removeFromCart(id) {
    set({ cart: get().cart.filter((item) => item.id !== id) });
  },
  clearCart() {
    set({ cart: [] });
  },
}));

interface CartState {
  cart: CartItem[];
  addToCart: (product: { id: number; sku: string; price: number }) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export type CartItem = {
  id: number;
  sku: string;
  qty: number;
  price: number; // snapshot harga
};

export const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: [],
      addToCart(product) {
        const cart = get().cart;
        const exists = cart.find((item) => item.id === product.id);
        if (exists) {
          set({
            cart: cart.map((item) =>
              item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              {
                id: product.id,
                sku: product.sku,
                qty: 1,
                price: product.price,
              },
            ],
          });
        }
      },
      // ...remove, clear, dll
    }),
    { name: "shopping-cart" }
  )
);
