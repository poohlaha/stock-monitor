/*!
  市场
*/

use std::fmt::Display;
use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use colored::Colorize;
use log::info;
use serde::{Deserialize, Serialize};

pub mod detail;
pub mod timeline;

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    pub market: String,
    pub code: String,
    #[serde(rename = "type")]
    pub _type: MarketType,
    #[serde(rename = "queryType")]
    pub query_type: String, // 查询类型: minute, fiveday, kline
    pub ktype: String, // day, week, month, quarter, year
}

// 市场类型
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum MarketType {
    Stock,
    Etf,
    Fund,
    #[default]
    Unknown,
}

impl Display for MarketType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let str = match self {
            MarketType::Stock => "stock".to_string(),
            MarketType::Etf => "etf".to_string(),
            MarketType::Fund => "fund".to_string(),
            MarketType::Unknown => "".to_string(),
        };
        write!(f, "{}", str)
    }
}

pub struct Market {}

impl Market {
    /**
      查询市场情况, 交易中/交易结束
      例: https://finance.pae.baidu.com/sapi/v1/marketquote?bizType=marketStatus&finClientType=pc
    **/
    pub async fn query_market_status() -> Result<HttpResponse, String> {
        let url = format!("{}/sapi/v1/marketquote?bizType=marketStatus&finClientType=pc", BD_HTTP_URL_PREFIX);
        info!("{} query market status url {}", LOGGER_PREFIX.cyan().bold(), url);

        Utils::get_time_response(&url).await
    }
}
