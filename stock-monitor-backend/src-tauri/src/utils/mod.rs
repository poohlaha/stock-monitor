use crate::prepare::{get_success_response, HttpResponse};
use crate::LOGGER_PREFIX;
use base64::Engine;
use colored::Colorize;
use http::options::Options;
use log::{error, info};

pub(crate) mod cache;
pub mod file;

pub struct Utils;

pub struct Cache;

impl Utils {
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

        let response = http::client::HttpClient::send(
            Options {
                url: url.to_string(),
                method: Some(String::from("GET")),
                data: None,
                form: None,
                headers: None,
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

                let body = res.body;
                let data = body.get("Result").unwrap();
                Ok(get_success_response(Some(data.clone())))
            }
            Err(err) => {
                error!("{} get data error: {:#?} .", LOGGER_PREFIX.cyan().bold(), err);
                Ok(crate::prepare::get_error_response("get data error!"))
            }
        }
    }
}
