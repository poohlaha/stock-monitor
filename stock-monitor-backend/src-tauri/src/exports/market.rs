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

/// 获取十大持仓等数据
#[tauri::command]
pub async fn query_open_data(code: &str) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_open_data(code).await
}

/// 获取全球市场数据
#[tauri::command]
pub async fn query_worldwide(market: &str) -> Result<HttpResponse, String> {
    Market::query_worldwide(market).await
}

/// 获取行情中心(全球)
#[tauri::command]
pub async fn query_worldwide_market_center() -> Result<HttpResponse, String> {
    Market::query_worldwide_market_center().await
}

/// 获取A股、港股等行情
#[tauri::command]
pub async fn query_other_market_center(market: &str) -> Result<HttpResponse, String> {
    Market::query_other_market_center(market).await
}

/// 获取A股、港股等行情
#[tauri::command]
pub async fn query_industrial_chain() -> Result<HttpResponse, String> {
    Market::query_industrial_chain().await
}

/// 查询经济指标
#[tauri::command]
pub async fn query_economic_indicators() -> Result<HttpResponse, String> {
    Market::query_economic_indicators().await
}

/// 查询热门指标
#[tauri::command]
pub async fn query_hot_indicators(name: &str) -> Result<HttpResponse, String> {
    Market::query_hot_indicators(name).await
}
