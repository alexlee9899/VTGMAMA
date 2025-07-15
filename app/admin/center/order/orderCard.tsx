import React from "react";

interface OrderItem {
  product_id: string;
  product_name: string;
  variable_id: string;
  variable_name: string;
  order_id: string;
  qty: number;
  unit_price: number;
  total_price: number;
}

interface Address {
  _id: string;
  user_id: string;
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  is_default: boolean;
}

interface DiscountCode {
  _id: string;
  code: string;
  value: number;
  strat_time: string;
  end_time: string;
  max_usage: number;
  create_at: string;
  min_amount: number;
  discount_type: string;
}

interface Order {
  order_id: string;
  address: Address;
  discount_code: DiscountCode | null;
  user_id: string;
  track_number: string;
  order_items: OrderItem[];
  total_amount: number;
  sale_amount: number;
  status: string;
  payment_method: string;
  placed_at: string;
  update_at: string;
}

const OrderCard = ({
  selectedOrder,
  setSelectedOrder,
  getStatusBadgeClass,
  formatDate,
}: {
  selectedOrder: Order;
  setSelectedOrder: (order: Order | null) => void;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
}) => {
  return (
    <div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Order #{selectedOrder.order_id}
          </h2>
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">
              Order Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Order Date:</span>{" "}
                {formatDate(selectedOrder.placed_at)}
              </p>
              <p>
                <span className="font-medium">Last Updated:</span>{" "}
                {formatDate(selectedOrder.update_at)}
              </p>
              <p>
                <span className="font-medium">Payment Method:</span>{" "}
                {selectedOrder.payment_method}
              </p>
              <p>
                <span className="font-medium">Tracking Number:</span>{" "}
                {selectedOrder.track_number || "Not available"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Shipping Address</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Recipient:</span>{" "}
                {selectedOrder.address.recipient_name}
              </p>
              <p>
                <span className="font-medium">Street:</span>{" "}
                {selectedOrder.address.street}
              </p>
              <p>
                <span className="font-medium">City:</span>{" "}
                {selectedOrder.address.city}
              </p>
              <p>
                <span className="font-medium">State:</span>{" "}
                {selectedOrder.address.state}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {selectedOrder.address.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Variant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedOrder.order_items.map(
                  (item: OrderItem, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.variable_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.qty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{(item.unit_price / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ¥{(item.total_price / 100).toFixed(2)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4">
                    ¥{(selectedOrder.total_amount / 100).toFixed(2)}
                  </td>
                </tr>
                {selectedOrder.discount_code && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-right font-medium"
                    >
                      Discount ({selectedOrder.discount_code.code}):
                    </td>
                    <td className="px-6 py-4">
                      -¥
                      {(
                        (selectedOrder.total_amount -
                          selectedOrder.sale_amount) /
                        100
                      ).toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right font-medium">
                    Total:
                  </td>
                  <td className="px-6 py-4 font-bold">
                    ¥{(selectedOrder.sale_amount / 100).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
