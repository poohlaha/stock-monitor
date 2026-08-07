//! search

use crate::prepare::HttpResponse;
use crate::search::search::Args;

/// 查找
#[tauri::command]
pub async fn search(args: Args) -> Result<HttpResponse, String> {
    crate::search::search::Search::search(&args).await
}
