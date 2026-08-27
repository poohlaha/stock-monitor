//! my fund

use crate::my::group::MyWatchGroup;
use crate::my::watch::MyWatchList;
use crate::prepare::HttpResponse;

/// 添加到我的自选列表
#[tauri::command]
pub async fn add_to_my_watchlist(args: crate::my::watch::Args) -> Result<HttpResponse, String> {
    MyWatchList::add(&args).await
}

/// 查找自选列表
#[tauri::command]
pub async fn query_watchlist() -> Result<HttpResponse, String> {
    MyWatchList::query_list().await
}

/// 根据基金代码查找基金
#[tauri::command]
pub async fn find_watch_list_by_code(code: &str) -> Result<HttpResponse, String> {
    MyWatchList::find_by_code(code).await
}

/// 根据基金代码批量查找基金
#[tauri::command]
pub async fn find_watch_list_by_codes(codes: Vec<String>) -> Result<HttpResponse, String> {
    MyWatchList::find_by_codes(&codes).await
}

/// 根据 groupId 查找
#[tauri::command]
pub async fn query_my_watch_list_by_group_id(group_id: &str) -> Result<HttpResponse, String> {
    MyWatchList::query_list_by_group_id(group_id).await
}

/// 分组: 添加
#[tauri::command]
pub async fn my_group_add(args: crate::my::group::Args) -> Result<HttpResponse, String> {
    MyWatchGroup::add(&args).await
}

/// 分组: 修改
#[tauri::command]
pub async fn my_group_update(args: crate::my::group::Args) -> Result<HttpResponse, String> {
    MyWatchGroup::update(&args).await
}

/// 分组: 列表
#[tauri::command]
pub async fn get_my_group_list() -> Result<HttpResponse, String> {
    MyWatchGroup::get_list().await
}

/// 分组: 删除
#[tauri::command]
pub async fn my_group_delete(args: crate::my::group::Args) -> Result<HttpResponse, String> {
    MyWatchGroup::delete(&args).await
}

/// 分组: 删除
#[tauri::command]
pub async fn get_my_group_watch_list() -> Result<HttpResponse, String> {
    MyWatchGroup::get_group_watch_list().await
}
