/*!
  市场
*/

use crate::market::Market;
use crate::market::timeline::{Args, Timeline};
use crate::prepare::HttpResponse;

/// 获取分时图数据
#[tauri::command]
pub async fn get_time_data(args: Args) -> Result<HttpResponse, String> {
    Timeline::get_data(&args).await
}

/// 查询市场情况, 交易中/交易结束
#[tauri::command]
pub async fn query_market_status() -> Result<HttpResponse, String> {
    Market::query_market_status().await
}