/*!
  使用百度搜索
  例: https://finance.pae.baidu.com/vapi/v1/sug?wd=588710&skip_login=1&finClientType=pc
*/

use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use colored::Colorize;
use log::info;
use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    name: String,
    value: String,
}

pub struct Search {}

impl Search {
    pub async fn search(args: &Args) -> Result<HttpResponse, String> {
        if args.value.is_empty() {
            return Ok(crate::prepare::get_error_response("`value` is empty !"));
        }

        let url = format!("{}/vapi/v1/sug?wd={}&skip_login=1&finClientType=pc", BD_HTTP_URL_PREFIX, args.value);
        info!("{} search url {}: ", LOGGER_PREFIX.cyan().bold(), url);

        Utils::get_time_response(&url).await
    }
}
