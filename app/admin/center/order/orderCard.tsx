import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

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
  refreshOrders, // 添加刷新订单列表的函数
}: {
  selectedOrder: Order;
  setSelectedOrder: (order: Order | null) => void;
  getStatusBadgeClass: (status: string) => string;
  formatDate: (dateString: string) => string;
  refreshOrders?: () => void; // 可选参数，用于刷新订单列表
}) => {
  // 添加状态管理弹窗和输入
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackNumber, setTrackNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 处理发货操作
  const handleDispatch = async () => {
    if (!trackNumber.trim()) {
      setError("请输入运单号");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken") || "";
      if (!token) {
        throw new Error("Authorization token not found");
      }

      // 发送发货请求
      const response = await axios.post(
        `${API_BASE_URL}/order/ship_order`,
        {
          order_id: selectedOrder.order_id,
          track_number: trackNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      // 请求成功
      setSuccess("发货成功！订单状态已更新");
      setIsModalOpen(false);

      // 更新本地订单状态
      const updatedOrder = {
        ...selectedOrder,
        status: "dispatched",
        track_number: trackNumber,
      };
      setSelectedOrder(updatedOrder);

      // 如果存在刷新函数，调用它刷新订单列表
      if (refreshOrders) {
        refreshOrders();
      }
    } catch (err) {
      console.error("发货失败:", err);
      setError("发货失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Order #{selectedOrder.order_id}
          </h2>
          <div className="flex space-x-2">
            {/* 添加Dispatch按钮，仅在订单状态不是dispatched时显示 */}
            {selectedOrder.status !== "dispatched" &&
              selectedOrder.status === "paid" && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors"
                >
                  Dispatch
                </button>
              )}
            <button
              onClick={() => setSelectedOrder(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

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

      {/* 添加Modal弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">发货订单</h3>
            <p className="mb-4 text-sm text-gray-600">
              请输入此订单的快递运单号
            </p>

            {error && (
              <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                运单号
              </label>
              <input
                type="text"
                value={trackNumber}
                onChange={(e) => setTrackNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入运单号"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDispatch}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors disabled:bg-green-300"
              >
                {isLoading ? "处理中..." : "确认发货"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
