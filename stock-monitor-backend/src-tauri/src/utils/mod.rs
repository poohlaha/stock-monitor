use crate::prepare::{get_success_response, HttpResponse};
use crate::utils::baidu::BaiduToken;
use crate::LOGGER_PREFIX;
use base64::Engine;
use colored::Colorize;
use http::options::Options;
use log::{error, info, warn};
use std::sync::OnceLock;

pub mod baidu;
pub(crate) mod cache;
pub mod file;

pub struct Utils;

static BAIDU_COOKIE: OnceLock<String> = OnceLock::new();

impl Utils {
    fn get_cookie() -> String {
        BAIDU_COOKIE.get().cloned().unwrap_or_default()
    }

    /// 生成 base64 图片
    pub fn generate_image(data: Vec<u8>) -> String {
        let str = base64::engine::general_purpose::STANDARD.encode::<Vec<u8>>(data);
        let mut content = String::from("data:image/png;base64,");
        content.push_str(&str);
        content
    }

    /// 使用 GET 方法查询数据
    pub async fn get_time_response(url: &str) -> Result<HttpResponse, String> {
        if url.is_empty() {
            return Ok(crate::prepare::get_error_response("url is empty!"));
        }

        // 获取token
        let token = BaiduToken::get_token_async().await;
        if token.is_none() {
            warn!("{} get baidu token error!", LOGGER_PREFIX);
        }

        let (token, cookie) = token.unwrap();
        info!("{} baidu token: {:#?}", LOGGER_PREFIX, token);
        info!("{} baidu cookie: {:#?}", LOGGER_PREFIX, cookie);

        let response = http::client::HttpClient::send(
            Options {
                url: url.to_string(),
                method: Some(String::from("GET")),
                data: None,
                form: None,
                headers: Some(serde_json::json!({
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
                    "Origin": "https://finance.baidu.com",
                    "Referer": "https://finance.baidu.com/",
                     "Accept": "application/vnd.finance-web.v1+json",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                    "Accept-Language": "zh-CN,zh;q=0.9",
                    "Connection": "keep-alive",
                    "Cache-Control": "no-cache",
                    "Pragma": "no-cache",
                    "Sec-Ch-Ua": "\"Not=A?Brand\";v=\"99\", \"Google Chrome\";v=\"151\", \"Chromium\";v=\"151\"",
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Platform": "macos",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-site",
                    "Acs-Token": token,
                     "Cookie": cookie
                })),
                timeout: Some(10),
            },
            false,
        )
        .await;

        info!("{} get data response {:#?} .", LOGGER_PREFIX.cyan().bold(), response);

        match response {
            Ok(res) => {
                if res.status_code != 200 {
                    return Ok(crate::prepare::get_error_response("get data error!"));
                }

                if let Some(cookie) = res.headers.get("set-cookie") {
                    let cookie = cookie.split(';').next().unwrap().to_string();

                    let _ = BAIDU_COOKIE.set(cookie);
                }

                let body = res.body;
                let data = match body.get("Result") {
                    Some(value) => value.clone(),
                    None => {
                        error!("{} missing Result, body: {:#?}", LOGGER_PREFIX, body);
                        return Ok(crate::prepare::get_error_response("missing Result"));
                    }
                };

                Ok(get_success_response(Some(data.clone())))
            }
            Err(err) => {
                error!("{} get data error: {:#?} .", LOGGER_PREFIX.cyan().bold(), err);
                Ok(crate::prepare::get_error_response("get data error!"))
            }
        }
    }
}
