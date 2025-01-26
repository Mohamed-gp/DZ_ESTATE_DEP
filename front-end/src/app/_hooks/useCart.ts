import {create} from 'zustand';
import { persist } from 'zustand/middleware';
interface CartItem {
    id: string;
    title: string;
    price: number;
    unit: string;
    image: string;
    location: {
      wilaya: string;
      commune: string;
    };
  }
  


interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => 
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price, 0);
      },
    }),
    {
      name: 'property-cart',
    }
  )
);