/*!
市场
*/

use crate::market::detail::MarketDetailInfo;
use crate::market::{Args, HotStockType, Market};
use crate::prepare::HttpResponse;

/// 获取分时图数据
#[tauri::command]
pub async fn get_time_data(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::get_time_data(&args).await
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

///  查询基金曲线
#[tauri::command]
pub async fn query_fund_graph(code: &str, name: &str, month: &str) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_fund_graph(code, name, month).await
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

/// 获取热门板块
#[tauri::command]
pub async fn query_popular_section(market: &str) -> Result<HttpResponse, String> {
    Market::query_popular_section(market).await
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

/// 行业资金流向
#[tauri::command]
pub async fn query_industry_fund_flow(args: Args, flow_type: &str) -> Result<HttpResponse, String> {
    Market::query_industry_fund_flow(&args, flow_type).await
}

/// 股票相关新闻
#[tauri::command]
pub async fn query_news(args: Args) -> Result<HttpResponse, String> {
    Market::query_news(&args).await
}

/// 公司介绍
#[tauri::command]
pub async fn query_company_info(args: Args) -> Result<HttpResponse, String> {
    Market::query_company_info(&args).await
}

/// 公司简况
#[tauri::command]
pub async fn query_company_profile(args: Args) -> Result<HttpResponse, String> {
    Market::query_company_profile(&args).await
}

/// 公司简况
#[tauri::command]
pub async fn query_executive_changes(args: Args, company_code: &str, inner_code: &str, group: &str, hold_type: &str) -> Result<HttpResponse, String> {
    Market::query_executive_changes(&args, company_code, inner_code, group, hold_type).await
}

/// 公司简况
#[tauri::command]
pub async fn query_by_url(url: &str) -> Result<HttpResponse, String> {
    Market::query_by_url(url).await
}

/// 热股榜
#[tauri::command]
pub async fn query_hot_stock_list(day: &str, hot_type: HotStockType, market: &str) -> Result<HttpResponse, String> {
    Market::query_hot_stock_list(day, hot_type, market).await
}

/// 财经日历
#[tauri::command]
pub async fn query_financial_calendar() -> Result<HttpResponse, String> {
    Market::query_financial_calendar().await
}

/// 查询涨跌分布
#[tauri::command]
pub async fn query_stock_rf_distribution(market: &str) -> Result<HttpResponse, String> {
    Market::query_stock_rf_distribution(market).await
}

/// 查询热力图
#[tauri::command]
pub async fn query_industry_hot(market: &str, sort_key: &str) -> Result<HttpResponse, String> {
    Market::query_industry_hot(market, sort_key).await
}

/// 查询排行
#[tauri::command]
pub async fn query_stock_rank(market: &str) -> Result<HttpResponse, String> {
    Market::query_stock_rank(market).await
}

/// 7 * 24 快讯
#[tauri::command]
pub async fn query_breaking_news(name: &str) -> Result<HttpResponse, String> {
    Market::query_breaking_news(name).await
}

/// 查询A|港|美股主力净流入
#[tauri::command]
pub async fn query_main_money_in(market: &str) -> Result<HttpResponse, String> {
    Market::query_main_money_in(market).await
}

/// 查询股评(浮动)
#[tauri::command]
pub async fn query_float_stock_commentary(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_float_stock_commentary(&args).await
}

/// 查询股票分析
#[tauri::command]
pub async fn query_stock_analysis(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_stock_analysis(&args).await
}

/// 查询关联标的
#[tauri::command]
pub async fn query_related_targets(args: Args) -> Result<HttpResponse, String> {
    MarketDetailInfo::query_related_targets(&args).await
}
