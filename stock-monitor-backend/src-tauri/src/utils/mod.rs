use crate::error::Error;
use crate::prepare::{get_success_response, HttpResponse};
use crate::utils::baidu::BaiduToken;
use crate::LOGGER_PREFIX;
use base64::Engine;
use colored::Colorize;
use http::options::{HttpError, Options};
use log::{error, info, warn};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::OnceLock;

pub mod baidu;
pub(crate) mod cache;
pub mod file;
pub mod handler;
pub mod json;

pub struct Utils;

impl Utils {
    /// 生成 base64 图片
    pub fn generate_image(data: Vec<u8>) -> String {
        let str = base64::engine::general_purpose::STANDARD.encode::<Vec<u8>>(data);
        let mut content = String::from("data:image/png;base64,");
        content.push_str(&str);
        content
    }

    pub async fn get_response(url: &str) -> Result<Value, String> {
        if url.is_empty() {
            return Err(Error::Error(String::from("`url` is empty!")).to_string());
        }

        // 获取token
        let token = BaiduToken::get_token_async().await;
        if token.is_none() {
            warn!("{} get baidu token error!", LOGGER_PREFIX);
        }

        let (token, cookie) = token.unwrap();
        // info!("{} baidu token: {:#?}", LOGGER_PREFIX, token);
        // info!("{} baidu cookie: {:#?}", LOGGER_PREFIX, cookie);

        let response = http::client::HttpClient::http_send(
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

        match response {
            Ok((status, _, body)) => {
                if !status.is_success() {
                    error!("status is not success");
                    return Err(Error::Error(String::from("get data error!")).to_string());
                }

                let body: Value = match serde_json::from_str(&body) {
                    Ok(value) => value,
                    Err(err) => {
                        error!("parse json error: {:?}", err);
                        return Err(Error::Error(String::from("parse json error!")).to_string());
                    }
                };

                // info!("{} response : {:#?}", LOGGER_PREFIX, body);

                let data = match body.get("Result") {
                    Some(value) => value.clone(),
                    None => {
                        error!("{} missing Result", LOGGER_PREFIX);
                        return Err(Error::Error(String::from("missing Result!")).to_string());
                    }
                };

                Ok(data)
            }
            Err(err) => {
                error!("{} get data error: {:#?} .", LOGGER_PREFIX.cyan().bold(), err);
                Err(Error::Error(String::from("get data error!")).to_string())
            }
        }
    }

    /// 使用 GET 方法查询数据
    pub async fn get_time_response(url: &str) -> Result<HttpResponse, String> {
        let response = Self::get_response(url).await;
        Self::parepare_response(response)
    }

    pub fn parepare_response(response: Result<Value, String>) -> Result<HttpResponse, String> {
        match response {
            Ok(data) => Ok(get_success_response(Some(data))),
            Err(err) => Ok(crate::prepare::get_error_response(&err)),
        }
    }
}
