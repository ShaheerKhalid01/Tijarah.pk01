'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import { APP_NAME, OrderStatus } from './constants.js';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useOrderUpdates } from '../../../hooks/useOrderUpdates';

// ✅ OPTIMIZED: Move constants outside component
const CURRENCY_RATES = { PKR_TO_USD: 0.0036 };
const EMPTY_STATE_CONFIG = {
  orders: {
    icon: '🛒',
    title: 'Order History Empty',
    message: 'Your shopping adventures haven\'t started yet.'
  },
  returns: {
    icon: '↩️',
    title: 'Zero Returns Processed',
    message: 'We pride ourselves on quality!'
  }
};

// ✅ OPTIMIZED: Extract OrderItem component
const OrderItem = memo(({ item, order, onRemoveItem, formatCurrency }) => (
  <div className="flex flex-col sm:flex-row gap-8 group/item">
    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden border-2 border-slate-100 flex-shrink-0 bg-slate-50 relative">
      <img
        src={item.image}
        alt={item.productName}
        className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
        loading="lazy"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-black text-slate-900 text-xl group-hover/item:text-blue-600 transition-colors truncate pr-4">
          {item.productName}
        </h4>
        <p className="font-black text-slate-900 text-2xl sm:hidden">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
      <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500 mb-6">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          Qty: {item.quantity}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          Unit: {formatCurrency(item.price)}
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="px-5 py-2.5 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
          Buy it again
        </button>
        {order.status !== 'cancelled' && (
          <button
            onClick={() => onRemoveItem(order._id || order.id || order.orderNumber, item.productId)}
            className="px-5 py-2.5 text-xs font-black text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
          >
            Remove item
          </button>
        )}
      </div>
    </div>
    <div className="hidden sm:block text-right">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        Item Total
      </p>
      <p className="font-black text-slate-900 text-2xl">
        {formatCurrency(item.price * item.quantity)}
      </p>
    </div>
  </div>
));

OrderItem.displayName = 'OrderItem';

// ✅ OPTIMIZED: Extract OrderHeader component
const OrderHeader = memo(({ order, formatCurrency, formatDate, getStatusBadge }) => (
  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-6">
    <div className="flex flex-wrap gap-8">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Date Placed
        </p>
        <p className="font-bold text-slate-900">{formatDate(order.createdAt)}</p>
      </div>
      <div className="hidden sm:block w-px h-10 bg-slate-200" />
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Total Amount
        </p>
        <p className="font-black text-slate-900 text-lg">{formatCurrency(order.total)}</p>
      </div>
      <div className="hidden sm:block w-px h-10 bg-slate-200" />
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Order ID
        </p>
        <p className="font-mono text-xs text-slate-500 font-bold px-2 py-1 bg-white border border-slate-200 rounded-lg">
          #{order.orderNumber}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
      {getStatusBadge(order.status)}
    </div>
  </div>
));

OrderHeader.displayName = 'OrderHeader';

// ✅ OPTIMIZED: Extract OrderFooter component
const OrderFooter = memo(({ order, onCancel, onDelete, router, params }) => (
  <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex flex-wrap justify-between items-center gap-6">
    <div className="flex gap-4">
      <button
        onClick={() => router.push(`/${params?.locale || 'en'}/customer-service#track`)}
        className="px-6 py-3 text-sm font-black text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-95"
      >
        Track Shipment
      </button>
    </div>
    <div className="flex items-center gap-4">
      {order.status !== 'cancelled' && (
        <button
          onClick={() => onCancel(order._id || order.id)}
          className="px-6 py-3 text-sm font-black text-rose-600 bg-rose-50 border-2 border-rose-100 rounded-2xl hover:bg-rose-100 transition-all active:scale-95"
        >
          Cancel Order
        </button>
      )}
      <button
        onClick={() => onDelete(order._id || order.id || order.orderNumber)}
        className="px-6 py-3 text-sm font-black text-slate-400 hover:text-slate-900 transition-all"
      >
        Delete Record
      </button>
    </div>
  </div>
));

OrderFooter.displayName = 'OrderFooter';

// ✅ OPTIMIZED: Extract OrderCard component
const OrderCard = memo(({ order, onRemoveItem, onCancel, onDelete, router, formatCurrency, formatDate, getStatusBadge, params }) => (
  <div className="group bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden">
    <OrderHeader order={order} formatCurrency={formatCurrency} formatDate={formatDate} getStatusBadge={getStatusBadge} />
    <div className="p-8">
      {order.items && order.items.length > 0 ? (
        <div className="space-y-10">
          {order.items.map((item) => (
            <OrderItem
              key={item.productId}
              item={item}
              order={order}
              onRemoveItem={onRemoveItem}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 font-semibold">
          No items in this order
        </div>
      )}
    </div>
    <OrderFooter order={order} onCancel={onCancel} onDelete={onDelete} router={router} params={params} />
  </div>
));

OrderCard.displayName = 'OrderCard';

// ✅ OPTIMIZED: Extract EmptyState component
const EmptyState = memo(({ type, onStartExploring }) => {
  const config = EMPTY_STATE_CONFIG[type] || EMPTY_STATE_CONFIG.orders;

  return (
    <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      </div>
      <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
        {config.title}
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto mb-10 text-lg font-medium">
        {config.message}
      </p>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';


// ✅ OPTIMIZED: Extract LoadingSpinner component
const LoadingSpinner = memo(() => (
  <div className="flex flex-col items-center justify-center py-32 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
      <div className="absolute top-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-slate-900 font-black text-lg">Synchronizing data</p>
      <p className="text-slate-400 text-sm font-medium">Fetching your encrypted transaction history...</p>
    </div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// ✅ OPTIMIZED: Extract TabButton component
const TabButton = memo(({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-5 text-base font-black tracking-tight transition-all relative ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    {label}
    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
      }`}>
      {count}
    </span>
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-full shadow-[0_-4px_10px_rgba(37,99,235,0.2)]" />
    )}
  </button>
));

TabButton.displayName = 'TabButton';

const ReturnsAndOrdersPage = () => {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { success, error, info } = useNotification();
  const { dialog, showConfirm, closeDialog } = useConfirmDialog();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [isLoading, setIsLoading] = useState(true);

  // ✅ OPTIMIZED: Regular formatters (no hooks needed)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format((amount || 0) * CURRENCY_RATES.PKR_TO_USD);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ OPTIMIZED: Memoize status badge
  const getStatusBadge = useCallback((status) => {
    const statusMap = {
      [OrderStatus.SHIPPED]: { text: 'Shipped', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      [OrderStatus.DELIVERED]: { text: 'Delivered', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      [OrderStatus.CANCELLED]: { text: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200' },
      [OrderStatus.PENDING]: { text: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    };

    const statusInfo = statusMap[status] || { text: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };

    return (
      <span className={`px-4 py-1.5 rounded-xl text-xs font-black border-2 ${statusInfo.color} uppercase tracking-wider shadow-sm`}>
        {statusInfo.text}
      </span>
    );
  }, []);

  // Real-time updates handler
  const handleOrderUpdate = useCallback((update) => {
    if (update.type === 'order_status_changed') {
      setOrders(prev => prev.map(order => {
        const orderIdString = order._id?.toString?.() || order._id;
        if (orderIdString === update.orderId || order.orderNumber === update.orderNumber) {
          return { ...order, status: update.newStatus };
        }
        return order;
      }));
    } else if (update.type === 'order_removed') {
      setOrders(prev => prev.filter(order => {
        const orderIdString = order._id?.toString?.() || order._id;
        return !(orderIdString === update.orderId || order.orderNumber === update.orderNumber);
      }));
    }
  }, []);

  // Listen for real-time updates
  useOrderUpdates(handleOrderUpdate);

  // ✅ OPTIMIZED: Memoize order fetching
  const fetchUserOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/orders/user');
      if (response.ok) {
        const data = await response.json();
        const apiOrders = data.orders || [];

        // Sort by date
        apiOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setOrders(apiOrders);
      } else {
        console.error('Failed to fetch orders from API');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ OPTIMIZED: Memoize remove item handler
  const handleRemoveItemFromOrder = useCallback(async (orderId, productId) => {
    const confirmed = await showConfirm({
      title: 'Remove Item',
      message: 'Remove this specific item from the order? This action cannot be undone.',
      confirmText: 'Remove Item',
      cancelText: 'Keep Item',
      type: 'warning'
    });

    if (!confirmed) return;

    try {
      const currentOrder = orders.find(o => (o._id || o.id) === orderId);
      if (!currentOrder) {
        error('Order not found', { title: 'Error' });
        return;
      }

      const newItems = currentOrder.items.filter(i => i.productId !== productId);
      const newTotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

      if (newItems.length === 0) {
        // All items removed - cancel order
        try {
          const dbOrderId = currentOrder._id || currentOrder.id;
          await fetch(`/api/admin/orders/${dbOrderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'cancelled',
              items: [],
              total: 0,
              subtotal: 0,
              cancelledAt: new Date().toISOString(),
              cancelledBy: 'customer',
              reason: 'All items removed by customer'
            })
          }).catch(() => null);
        } catch (err) {
          console.error('Error cancelling order:', err);
        }

        setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
        const existingOrders = JSON.parse(localStorage.getItem('localOrders') || '[]');
        localStorage.setItem('localOrders', JSON.stringify(
          existingOrders.filter(order => (order._id || order.id) !== orderId)
        ));
        success('Order removed - all items deleted!', { title: 'Order Removed' });
        return;
      }

      // Update order with removed item
      const updatedOrder = {
        ...currentOrder,
        items: newItems,
        total: newTotal,
        subtotal: newTotal,
        updatedAt: new Date().toISOString()
      };

      setOrders(prev => prev.map(o => (o._id || o.id) === orderId ? updatedOrder : o));

      const existingOrders = JSON.parse(localStorage.getItem('localOrders') || '[]');
      const updated = existingOrders.map(order =>
        (order._id || order.id || order.orderNumber) === orderId ? updatedOrder : order
      );
      localStorage.setItem('localOrders', JSON.stringify(updated));

      success('Item removed successfully');
    } catch (err) {
      console.error('Error removing item:', err);
      error(`Failed to remove item: ${err.message}`, { title: 'Error' });
    }
  }, [orders, showConfirm, success, error]);

  // ✅ OPTIMIZED: Memoize remove order handler
  const handleRemoveOrder = useCallback(async (orderId) => {
    const confirmed = await showConfirm({
      title: 'Cancel & Delete Order',
      message: 'Cancel this order and remove it from your view?',
      confirmText: 'Cancel & Delete',
      cancelText: 'Keep Order',
      type: 'warning'
    });

    if (!confirmed) return;

    try {
      const currentOrder = orders.find(o => (o._id || o.id) === orderId);
      if (!currentOrder) {
        error('Order not found!', { title: 'Order Not Found' });
        return;
      }

      try {
        const dbOrderId = currentOrder._id || currentOrder.id;
        await fetch(`/api/admin/orders/${dbOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'customer',
            reason: 'Order removed by customer'
          })
        }).catch(() => null);
      } catch (err) {
        console.error('Error cancelling order:', err);
      }

      setOrders(prev => prev.filter(o => (o._id || o.id) !== orderId));
      const existingOrders = JSON.parse(localStorage.getItem('localOrders') || '[]');
      localStorage.setItem('localOrders', JSON.stringify(
        existingOrders.filter(order => (order._id || order.id) !== orderId)
      ));

      const completelyRemovedOrders = JSON.parse(localStorage.getItem('completelyRemovedOrders') || '[]');
      const orderIdToMatch = currentOrder._id || currentOrder.id || currentOrder.orderNumber;
      if (!completelyRemovedOrders.includes(orderIdToMatch)) {
        completelyRemovedOrders.push(orderIdToMatch);
        localStorage.setItem('completelyRemovedOrders', JSON.stringify(completelyRemovedOrders));
      }

      success('Order deleted successfully!', { title: 'Order Deleted' });
    } catch (err) {
      console.error('Error deleting order:', err);
      error('Failed to delete order', { title: 'Error' });
    }
  }, [orders, showConfirm, success, error]);

  // ✅ OPTIMIZED: Memoize cancel order handler
  const handleCancelOrder = useCallback(async (orderId) => {
    const confirmed = await showConfirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order?',
      confirmText: 'Cancel Order',
      cancelText: 'Keep Order',
      type: 'warning'
    });

    if (!confirmed) return;

    try {
      const currentOrder = orders.find(o => (o._id || o.id) === orderId);
      if (!currentOrder) {
        error('Order not found!', { title: 'Order Not Found' });
        return;
      }

      const dbOrderId = currentOrder._id || currentOrder.id;
      await fetch(`/api/admin/orders/${dbOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      }).catch(() => null);

      setOrders(prev => prev.map(o => (o._id || o.id) === orderId ? { ...o, status: 'cancelled' } : o));
      success('Order cancelled successfully!', { title: 'Order Cancelled' });
    } catch (err) {
      console.error('Error cancelling order:', err);
      error('Failed to cancel order', { title: 'Error' });
    }
  }, [orders, showConfirm, success, error]);


  // Auth check and fetch orders
  useEffect(() => {
    if (status === 'unauthenticated') {
      const currentLocale = params?.locale || 'en';
      router.push(`/${currentLocale}/login`);
      return;
    }
    if (status === 'authenticated') {
      fetchUserOrders();
    }
  }, [status, router, fetchUserOrders, params?.locale]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-10 bg-blue-600 rounded-full shadow-sm" />
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Orders & Returns</h1>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl">
            Monitor your purchase journey, request returns, and manage your account activity seamlessly.
          </p>
        </div>


        <div className="flex items-center gap-10 mb-10 border-b border-slate-200">
          <TabButton
            active={activeTab === 'orders'}
            label="My Orders"
            count={orders.length}
            onClick={() => setActiveTab('orders')}
          />
          <TabButton
            active={activeTab === 'returns'}
            label="Returns"
            count={0}
            onClick={() => setActiveTab('returns')}
          />
          <button
            onClick={fetchUserOrders}
            disabled={isLoading}
            className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              }`}
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : activeTab === 'orders' ? (
          orders.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {orders.map((order) => (
                <OrderCard
                  key={order._id || order.orderNumber}
                  order={order}
                  onRemoveItem={handleRemoveItemFromOrder}
                  onCancel={handleCancelOrder}
                  onDelete={handleRemoveOrder}
                  router={router}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                  params={params}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="orders" onStartExploring={() => { router.push(`/${params?.locale || 'en'}/products`); }} />
          )
        ) : (
          <EmptyState type="returns" />
        )}
      </div>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        type={dialog.type}
        isLoading={dialog.isLoading}
      />
    </div>
  );
};

export default ReturnsAndOrdersPage;