/*!
市场
*/

use crate::market::detail::MarketDetailInfo;
use crate::market::timeline::Timeline;
use crate::market::{Args, Market};
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

/// 查询持仓分布
#[tauri::command]
pub async fn query_position_distribution(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_position_distribution(&args).await
}

/// 查询简况
#[tauri::command]
pub async fn query_brief(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_brief(&args).await
}

/// 获取收益
#[tauri::command]
pub async fn query_income(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_income(&args).await
}
