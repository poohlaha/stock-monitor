// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod error;
mod exports;
mod setting;
mod system;
mod task;
mod utils;

mod prepare;

mod helper;
mod market;
mod my;
mod search;

use lazy_static::lazy_static;
use rayon::ThreadPoolBuilder;

use crate::database::Database;
use crate::system::tray::Tray;
use exports::market::{get_time_data, query_brief, query_market_status, query_position_distribution, query_income};
use exports::my::{add_to_my_fund_watchlist, find_by_fund_code, find_by_fund_codes};
use exports::search::search;
use exports::settings::{get_setting, hide_dock, save_setting, show_dock};
use log::info;
use sqlx::MySql;
use std::sync::{Arc, Mutex};
use tauri::Manager;

const PROJECT_NAME: &str = "stock-monitor";

const LOGGER_PREFIX: &str = "[Stock Monitor]: ";

// 百度
const BD_HTTP_URL_PREFIX: &str = "https://finance.pae.baidu.com/";

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
            add_to_my_fund_watchlist,
            find_by_fund_code,
            find_by_fund_codes,
            get_time_data,
            query_market_status,
            query_position_distribution,
            query_income,
            query_brief
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
