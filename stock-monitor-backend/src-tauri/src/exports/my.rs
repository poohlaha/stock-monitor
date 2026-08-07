//! my fund

use crate::my::Args;
use crate::prepare::HttpResponse;

/// 添加到我的自选列表
#[tauri::command]
pub async fn add_to_my_fund_watchlist(args: Args) -> Result<HttpResponse, String> {
    crate::my::MyFund::add(&args).await
}

/// 根据基金代码查找基金
#[tauri::command]
pub async fn find_by_fund_code(fund_code: &str) -> Result<HttpResponse, String> {
    crate::my::MyFund::find_by_fund_code(fund_code).await
}

/// 根据基金代码批量查找基金
#[tauri::command]
pub async fn find_by_fund_codes(fund_codes: Vec<String>) -> Result<HttpResponse, String> {
    crate::my::MyFund::find_by_fund_codes(&fund_codes).await
}
