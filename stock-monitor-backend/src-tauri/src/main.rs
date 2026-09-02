// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate core;

mod database;
mod error;
mod exports;
mod setting;
mod system;
mod task;
mod utils;

mod prepare;

pub mod asset;
pub mod fund;
mod helper;
mod market;
mod my;
mod search;
pub mod stock;

use lazy_static::lazy_static;
use rayon::ThreadPoolBuilder;

use crate::database::Database;
use crate::system::tray::Tray;
use crate::utils::baidu::{BaiduAuth, BaiduToken, BAIDU_REFRESHING, BAIDU_TOKEN, BAIDU_TOKEN_NOTIFY};
use exports::market::{
    query_breaking_news, query_brief, query_by_url, query_company_info, query_company_profile, query_economic_indicators, query_executive_changes, query_financial_calendar, query_float_stock_commentary, query_fund_graph, query_fund_info,
    query_hot_indicators, query_hot_stock_list, query_income, query_industrial_chain, query_industry_fund_flow, query_industry_hot, query_kline_data, query_main_money_in, query_market_status, query_news, query_popular_section,
    query_position_distribution, query_related_targets, query_stock_analysis, query_stock_info_data, query_stock_rank, query_stock_rf_distribution, query_time_division, query_worldwide, query_worldwide_market_center,
};
use exports::my::{add_to_my_watchlist, find_watch_list_by_code, find_watch_list_by_codes, get_my_group_list, get_my_group_watch_list, my_group_add, my_group_delete, my_group_update, query_my_watch_list_by_group_id, query_watchlist};
use exports::search::search;
use exports::settings::{get_setting, hide_dock, save_setting, show_dock};
use log::info;
use sqlx::MySql;
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{Listener, Manager};

const PROJECT_NAME: &str = "stock-monitor";

const LOGGER_PREFIX: &str = "[Stock Monitor]: ";

// 百度
const BD_HTTP_URL_PREFIX: &str = "https://finance.pae.baidu.com/";

const BD_HTTP_URL_PREFIX2: &str = "https://finance.baidu.com/";

pub(crate) const MAX_THREAD_COUNT: u32 = 4;

pub(crate) const MAX_DATABASE_COUNT: u32 = 5;
pub(crate) const LOOP_SEC: u64 = 10;

const DATABASE_URL: &str = "mysql://root:123456@localhost/stock";

// 定义全局 数据库连接池
lazy_static! {
    static ref DATABASE_POOLS: Arc<Mutex<Option<sqlx::Pool<MySql>>>> = Arc::new(Mutex::new(None));
}

/// 初始化一些属性
async fn init() {
    // 设置并行任务最大数
    ThreadPoolBuilder::new().num_threads(MAX_THREAD_COUNT as usize).build_global().expect("Failed to build global thread pool");
}

// 日志目录: /Users/xxx/Library/Logs/stock-monitor
// 程序配置目录: /Users/xxx/Library/Application Support/stock-monitor
#[tokio::main]
async fn main() {
    info!("PATH: {:?}", std::env::var("PATH"));

    // 创建数据库连接池
    Database::create_db().await.unwrap();

    // tauri
    let builder = tauri::Builder::default()
        // .plugin(tauri_plugin_window::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_positioner::init())
        // .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let window = app.get_webview_window("main");
            if let Some(window) = window {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }))
        .plugin(tauri_plugin_autostart::init(tauri_plugin_autostart::MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"])))
        .setup(move |app| {
            let app_handle = app.handle();

            // 创建系统托盘
            Tray::builder(&app_handle);

            app.listen("baidu-token", move |event| {
                let payload = event.payload();
                let payload = payload.replace("\\\"", "\"");

                let payload = payload.trim_matches('"').to_string();
                let auth: BaiduAuth = serde_json::from_str(&payload).unwrap();

                info!("{} 收到百度 token: {}", LOGGER_PREFIX, &auth.token);
                info!("{} 收到百度 cookie: {}", LOGGER_PREFIX, &auth.cookie);

                let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
                let mut store = BAIDU_TOKEN.write().unwrap();
                store.token = auth.token;
                store.cookie = auth.cookie;
                store.expire_at = now + 1;

                BAIDU_REFRESHING.store(false, Ordering::SeqCst);

                BAIDU_TOKEN_NOTIFY.notify_waiters();
            });

            BaiduToken::create_baidu_window(&app_handle);

            /*
            // 开机启动
            // 获取自动启动管理器
            let autostart_manager = app.autolaunch();
            // 启用 autostart
            let _ = autostart_manager.enable();
            // 检查 enable 状态
            println!("registered for autostart? {}", autostart_manager.is_enabled().unwrap());
            // 禁用 autostart
            // let _ = autostart_manager.disable();
             */

            // 初始化
            tauri::async_runtime::spawn(async move {
                init().await;
            });

            Ok(())
        })
        .on_window_event(|app, event| {
            if let tauri::WindowEvent::Focused(false) = event {
                //info!("focused false...");
                if let Some(window) = app.get_webview_window("main") {
                    // let _ = window.hide();
                }
            }

            /*
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                info!("close requested !");
                api.prevent_close(); // 阻止关闭
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.hide(); // 最小化到托盘
                }

                // 隐藏 Dock 图标
                // NSApplicationActivationPolicy::Prohibited: 不会显示在 Dock，无法成为活跃应用，无法接受键盘输入
                // #[cfg(target_os = "macos")]
                {
                    use cocoa::appkit::NSApplication;
                    unsafe {
                        let ns_app = cocoa::appkit::NSApp();
                        ns_app.setActivationPolicy_(cocoa::appkit::NSApplicationActivationPolicy::NSApplicationActivationPolicyProhibited);
                    }
                }
            }
             */
        });

    let app = builder
        .invoke_handler(tauri::generate_handler![
            save_setting,
            get_setting,
            show_dock,
            hide_dock,
            search,
            add_to_my_watchlist,
            find_watch_list_by_code,
            find_watch_list_by_codes,
            query_time_division,
            query_market_status,
            query_position_distribution,
            query_income,
            query_brief,
            query_fund_info,
            query_worldwide,
            query_worldwide_market_center,
            query_popular_section,
            query_industrial_chain,
            query_economic_indicators,
            query_hot_indicators,
            query_watchlist,
            query_fund_graph,
            query_industry_fund_flow,
            query_news,
            query_company_info,
            query_company_profile,
            query_executive_changes,
            query_by_url,
            query_hot_stock_list,
            query_financial_calendar,
            query_stock_rf_distribution,
            query_industry_hot,
            query_stock_rank,
            query_breaking_news,
            query_main_money_in,
            query_float_stock_commentary,
            query_stock_analysis,
            query_related_targets,
            my_group_add,
            my_group_update,
            get_my_group_list,
            my_group_delete,
            get_my_group_watch_list,
            query_my_watch_list_by_group_id,
            query_stock_info_data,
            query_kline_data
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    // #[cfg(target_os = "macos")]
    // app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    app.run(move |app, event| match &event {
        tauri::RunEvent::Reopen { has_visible_windows, .. } => {
            info!("reopen window");
            if !has_visible_windows {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                }
            }
        }
        _ => (),
    });
}
