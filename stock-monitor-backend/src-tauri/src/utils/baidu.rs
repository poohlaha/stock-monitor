/*!
  获取百度 Token
*/

use crate::{BD_HTTP_URL_PREFIX2, LOGGER_PREFIX};
use log::{error, info};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{LazyLock, Mutex, OnceLock, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};
use tokio::sync::Notify;
use tokio::time::{timeout, Duration};

pub struct BaiduToken {
    pub token: String,
    pub expire_at: u64,
}

impl BaiduToken {
    pub const fn empty() -> Self {
        Self { token: String::new(), expire_at: 0 }
    }

    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();

        now >= self.expire_at
    }

    pub fn get_token() -> Option<String> {
        let store = BAIDU_TOKEN.read().unwrap();

        if store.token.is_empty() {
            return None;
        }

        if store.is_expired() {
            return None;
        }

        Some(store.token.clone())
    }

    // 创建百度隐藏webview
    pub fn create_baidu_window(app: &AppHandle) {
        // 防止重复创建
        if app.get_webview_window("baidu").is_some() {
            return;
        }

        let url = format!("{}", BD_HTTP_URL_PREFIX2).parse().unwrap();

        let window = WebviewWindowBuilder::new(app, "baidu", WebviewUrl::External(url)).title("baidu").visible(false).build();

        match window {
            Ok(win) => {
                info!("{} baidu webview created", LOGGER_PREFIX);

                // 保存窗口
                BAIDU_WINDOW.set(win.clone()).ok();

                BaiduToken::init_baidu(win);
            }
            Err(e) => {
                error!("{} create baidu error: {}", LOGGER_PREFIX, e);
            }
        }
    }

    pub fn init_baidu(window: WebviewWindow) {
        window
            .eval(
                r#"
                    (function(){
                    console.log("start check paris");

                    let timer = setInterval(()=>{
                        console.log("check:", !!window.paris_2108);
                        if(window.paris_2108){
                            clearInterval(timer);
                            console.log("paris ready");

                            window.paris_2108.getAcsInstance(
                            function(err, instance){
                                console.log("getAcsInstance", err, instance);
                                if(err){
                                    return;
                                }

                                instance.getSign(
                                    function(err, sign){
                                        console.log("getSign result", err, sign);
                                         clearInterval(timer);
                                        if(err){
                                            return;
                                        }

                                        if (sign) {
                                           console.log(window.__TAURI__.event);
                                           window.__TAURI__.event.emit("baidu-token", sign).then(() => {
                                                console.log("emit success");
                                           }).catch(e => {
                                                console.error("emit error", e);
                                           });
                                        }
                                    }
                                );

                            });
                        }

                    },1000);
                    })();

            "#,
            )
            .unwrap();
    }

    pub fn refresh_baidu_token() {
        if let Some(window) = BAIDU_WINDOW.get() {
            if let Err(e) = window.eval(
                r#"
                    (function(){
                        if(!window.paris_2108){
                            return;
                        }

                        window.paris_2108.getAcsInstance(
                            function(err,instance){
                                if(err){
                                    return;
                                }

                                instance.getSign(
                                    function(err,sign){
                                        if(err){
                                            return;
                                        }

                                        window.__TAURI__.event.emit("baidu-token", sign);
                                    }
                                );
                            }
                        );

                    })();
            "#,
            ) {
                error!("{} refresh token error:{}", LOGGER_PREFIX, e);
            }
        }
    }

    pub async fn get_token_async() -> Option<String> {
        loop {
            if let Some(token) = Self::get_token() {
                return Some(token);
            }

            let notified = BAIDU_TOKEN_NOTIFY.notified();

            let need_refresh = {
                let _lock = BAIDU_REFRESH_LOCK.lock().unwrap();

                if Self::get_token().is_some() {
                    false
                } else {
                    !BAIDU_REFRESHING.swap(true, Ordering::SeqCst)
                }
            };

            if need_refresh {
                info!("{} refresh token", LOGGER_PREFIX);
                Self::refresh_baidu_token();
            }

            if timeout(Duration::from_secs(5), notified).await.is_err() {
                return None;
            }
        }
    }
}

pub static BAIDU_TOKEN: LazyLock<RwLock<BaiduToken>> = LazyLock::new(|| RwLock::new(BaiduToken::empty()));

static BAIDU_WINDOW: OnceLock<WebviewWindow> = OnceLock::new();

pub static BAIDU_TOKEN_NOTIFY: LazyLock<Notify> = LazyLock::new(|| Notify::new());

pub static BAIDU_REFRESH_LOCK: LazyLock<Mutex<()>> = LazyLock::new(|| Mutex::new(()));

pub static BAIDU_REFRESHING: AtomicBool = AtomicBool::new(false);
