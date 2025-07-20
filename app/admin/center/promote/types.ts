// 促销码类型定义
export interface PromoteCode {
  _id: string;
  code: string;
  value: number;
  strat_time: string; // API返回的字段名称是strat_time (有拼写错误)
  end_time: string;
  max_usage: number;
  create_at: string;
  min_amount?: number;
  discount_type: "percentage" | "deduct";
}

// 创建/更新促销码请求参数
export interface PromoteCodeRequest {
  code: string;
  value: number;
  start_time: string; // 创建时使用的是start_time
  end_time: string;
  max_usage: number;
  min_amount?: number;
  discount_type: "percentage" | "deduct";
}

// 促销码列表响应
export interface PromoteCodesResponse {
  _id: string;
  code: string;
  value: number;
  strat_time: string;
  end_time: string;
  max_usage: number;
  create_at: string;
  min_amount: number;
  discount_type: "percentage" | "deduct";
} 