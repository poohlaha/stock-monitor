/*!
  市场
*/
use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use colored::Colorize;
use log::info;

pub mod detail;
pub mod timeline;

pub struct Market {}

impl Market {
    /**
      查询市场情况, 交易中/交易结束
      例: https://finance.pae.baidu.com/sapi/v1/marketquote?bizType=marketStatus&finClientType=pc
    **/
    pub async fn query_market_status() -> Result<HttpResponse, String> {
        let url = format!("{}/sapi/v1/marketquote?bizType=marketStatus&finClientType=pc", BD_HTTP_URL_PREFIX);
        info!("{} query market status url {}: ", LOGGER_PREFIX.cyan().bold(), url);

        Utils::get_time_response(&url).await
    }
}
