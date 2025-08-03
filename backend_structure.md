# VTGMAMA 在线商城后端数据库设计

## 数据库模型设计

### 用户模型(User)

```
User {
  _id: string            // MongoDB ObjectId
  email: string          // 用户邮箱，唯一
  password: string       // 加密后的密码
  first_name: string     // 名
  last_name: string      // 姓
  phone?: string         // 电话号码(可选)
  created_at: Date       // 创建时间
  updated_at: Date       // 更新时间
  role: "user" | "admin" // 用户角色
}
```

### 地址模型(Address)

```
Address {
  _id: string            // MongoDB ObjectId
  user_id: string        // 关联用户ID
  recipient_name: string // 收件人姓名
  street: string         // 街道地址
  city: string           // 城市
  state: string          // 省/州
  phone: string          // 电话号码
  is_default: boolean    // 是否默认地址
}
```

### 产品类别模型(Category)

```
Category {
  _id: string            // MongoDB ObjectId
  name: string           // 类别名称
  description: string    // 类别描述
  created_at: Date       // 创建时间
  updated_at: Date       // 更新时间
}
```

### 标签模型(Tag)

```
Tag {
  _id: string            // MongoDB ObjectId
  name: string           // 标签名称
  created_at: Date       // 创建时间
}
```

### 产品模型(Product)

```
Product {
  _id: string            // MongoDB ObjectId
  name: string           // 产品名称
  description: string    // 产品描述
  price: number          // 价格(单位:分)
  stock: number          // 库存数量
  images: string[]       // 产品图片URL数组
  category_id: string    // 关联类别ID
  tags: string[]         // 关联标签ID数组
  variables?: ProductVariable[] // 产品变体(可选，如尺寸、颜色等)
  created_at: Date       // 创建时间
  updated_at: Date       // 更新时间
  status: "active" | "inactive" | "deleted" // 产品状态
}

ProductVariable {
  _id: string            // MongoDB ObjectId
  name: string           // 变体名称(如"红色"、"L码")
  price: number          // 变体价格(单位:分)
  stock: number          // 变体库存
}
```

### 促销码模型(PromoteCode)

```
PromoteCode {
  _id: string            // MongoDB ObjectId
  code: string           // 促销码
  value: number          // 折扣值(对于percentage类型是0-1之间的小数，如0.85表示85折；对于deduct类型是分)
  strat_time: Date       // 开始时间(注意API中有拼写错误)
  end_time: Date         // 结束时间
  max_usage: number      // 最大使用次数
  create_at: Date        // 创建时间
  min_amount?: number    // 最低订单金额要求(可选，单位:分)
  discount_type: "percentage" | "deduct" // 折扣类型(百分比或固定金额)
}
```

### 购物车模型(Cart)

```
Cart {
  _id: string            // MongoDB ObjectId
  user_id: string        // 关联用户ID
  items: CartItem[]      // 购物车项目
  updated_at: Date       // 更新时间
}

CartItem {
  product_id: string     // 产品ID
  variable_id?: string   // 产品变体ID(可选)
  quantity: number       // 数量
  price: number          // 单价(单位:分)
}
```

### 订单模型(Order)

```
Order {
  order_id: string       // 订单ID(自定义格式)
  user_id: string        // 用户ID
  address: Address       // 配送地址
  order_items: OrderItem[] // 订单项目
  total_amount: number   // 订单总金额(单位:分)
  sale_amount: number    // 实付金额(单位:分)
  status: "pending" | "paid" | "dispatched" | "delivered" | "cancelled" // 订单状态
  payment_method: string // 支付方式
  track_number?: string  // 物流单号(可选)
  discount_code?: DiscountCode // 使用的促销码(可选)
  placed_at: Date        // 下单时间
  update_at: Date        // 更新时间
}

OrderItem {
  product_id: string     // 产品ID
  product_name: string   // 产品名称(冗余存储)
  variable_id?: string   // 产品变体ID(可选)
  variable_name?: string // 产品变体名称(可选，冗余存储)
  order_id: string       // 所属订单ID
  qty: number            // 数量
  unit_price: number     // 单价(单位:分)
  total_price: number    // 总价(单位:分)
}
```

## API 端点设计

### 用户认证相关 API

- **用户注册**: POST `/auth/register`

  ```
  请求体: { email, password, first_name, last_name, phone? }
  ```

- **用户登录**: POST `/auth/login`

  ```
  请求体: { email, password }
  响应: { token, user }
  ```

- **请求重置密码**: POST `/auth/request_reset_password`

  ```
  请求体: { email }
  ```

- **重置密码**: POST `/auth/reset_password`

  ```
  请求体: { new_password, token }
  ```

- **管理员登录**: POST `/admin/login`
  ```
  请求体: { email, password }
  响应: { token, user }
  ```

### 产品相关 API

- **获取所有产品**: GET `/products`

  ```
  查询参数: { page_idx?, page_size?, category_id?, tag_id?, search? }
  ```

- **获取产品详情**: GET `/products/{product_id}`

- **创建产品(管理员)**: POST `/admin/product/create`

  ```
  请求体: { name, description, price, stock, images, category_id, tags, variables? }
  ```

- **更新产品(管理员)**: POST `/admin/product/update/{product_id}`

  ```
  请求体: { name?, description?, price?, stock?, images?, category_id?, tags?, variables? }
  ```

- **删除产品(管理员)**: DELETE `/admin/product/delete/{product_id}`

### 类别相关 API

- **获取所有类别**: GET `/categories`

- **创建类别(管理员)**: POST `/admin/category/create`

  ```
  请求体: { name, description }
  ```

- **更新类别(管理员)**: POST `/admin/category/update/{category_id}`

  ```
  请求体: { name?, description? }
  ```

- **删除类别(管理员)**: DELETE `/admin/category/delete/{category_id}`

### 标签相关 API

- **获取所有标签**: GET `/tags`

- **创建标签(管理员)**: POST `/admin/tag/create`

  ```
  请求体: { name }
  ```

- **更新标签(管理员)**: POST `/admin/tag/update/{tag_id}`

  ```
  请求体: { name }
  ```

- **删除标签(管理员)**: DELETE `/admin/tag/delete/{tag_id}`

### 购物车相关 API

- **获取购物车**: GET `/cart`

- **添加商品到购物车**: POST `/cart/add`

  ```
  请求体: { product_id, variable_id?, quantity }
  ```

- **更新购物车项**: POST `/cart/update`

  ```
  请求体: { product_id, variable_id?, quantity }
  ```

- **删除购物车项**: POST `/cart/remove`
  ```
  请求体: { product_id, variable_id? }
  ```

### 订单相关 API

- **创建订单**: POST `/order/create`

  ```
  请求体: { address_id, payment_method, discount_code? }
  ```

- **获取用户订单列表**: GET `/order/user_orders`

  ```
  查询参数: { page_idx?, page_size? }
  ```

- **获取订单详情**: GET `/order/detail/{order_id}`

- **取消订单**: POST `/order/cancel/{order_id}`

- **支付订单**: POST `/order/pay/{order_id}`

  ```
  请求体: { payment_details }
  ```

- **发货订单(管理员)**: POST `/order/ship_order`

  ```
  请求体: { order_id, track_number }
  ```

- **获取所有订单(管理员)**: GET `/admin/shop_orders`
  ```
  查询参数: { page_idx?, page_size? }
  ```

### 地址相关 API

- **获取用户地址**: GET `/user/addresses`

- **创建地址**: POST `/user/address/create`

  ```
  请求体: { recipient_name, street, city, state, phone, is_default }
  ```

- **更新地址**: POST `/user/address/update/{address_id}`

  ```
  请求体: { recipient_name?, street?, city?, state?, phone?, is_default? }
  ```

- **删除地址**: DELETE `/user/address/delete/{address_id}`

### 促销码相关 API

- **获取所有促销码(管理员)**: GET `/promote/all_discount/`

- **获取促销码详情(管理员)**: GET `/promote/get/{discount_id}`

- **创建促销码(管理员)**: POST `/promote/create`

  ```
  请求体: {
    code,
    value,        // 对于percentage类型是0-1之间的小数，对于deduct类型是分
    start_time,   // ISO格式日期时间字符串
    end_time,     // ISO格式日期时间字符串
    max_usage,
    min_amount?,  // 可选
    discount_type // "percentage" 或 "deduct"
  }
  ```

- **更新促销码(管理员)**: POST `/promote/update/{discount_id}`

  ```
  请求体: {
    code?,
    value?,
    start_time?,
    end_time?,
    max_usage?,
    min_amount?,
    discount_type?
  }
  ```

- **删除促销码(管理员)**: DELETE `/promote/delete/{discount_id}`

- **验证促销码**: POST `/promote/verify`
  ```
  请求体: { code, order_amount }
  响应: { valid: boolean, discount_amount?, error_message? }
  ```

## 数据库关系

1. **User - Address**: 一对多关系 (一个用户可以有多个地址)
2. **User - Order**: 一对多关系 (一个用户可以有多个订单)
3. **User - Cart**: 一对一关系 (一个用户有一个购物车)
4. **Product - Category**: 多对一关系 (多个产品属于一个类别)
5. **Product - Tag**: 多对多关系 (产品可以有多个标签，标签可以关联多个产品)
6. **Order - OrderItem**: 一对多关系 (一个订单包含多个订单项)
7. **Order - PromoteCode**: 多对一关系 (多个订单可以使用同一个促销码)
