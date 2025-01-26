import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/app/_hooks/useCart';

export const CartWidget = () => {
  const { items, removeItem, getTotalPrice } = useCart();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button 
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          onClick={() => (document.getElementById('cart-modal') as HTMLDialogElement)?.showModal()}
        >
          <ShoppingCart className="w-6 h-6" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {items.length}
            </span>
          )}
        </button>
      </div>

      <dialog id="cart-modal" className="modal rounded-lg p-6 w-full max-w-md">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <button 
              onClick={() => (document.getElementById('cart-modal') as HTMLDialogElement)?.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      width={80}
                      height={80}
                      className="object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        {item.location.wilaya}, {item.location.commune}
                      </p>
                      <p className="text-blue-600 font-medium">
                        ${item.price} / {item.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-semibold">${getTotalPrice()}</span>
                </div>
                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};
