/*!
  分时图
*/
use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use colored::Colorize;
use log::{info};
use serde::{Deserialize, Serialize};
use serde_json::{json, to_value, Error, Value};

pub struct Timeline {}

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    pub market: String,
    pub code: String,
    #[serde(rename = "type")]
    pub _type: String,
    #[serde(rename = "queryType")]
    pub query_type: String, // 查询类型: minute, fiveday, kline
    pub ktype: String // day, week, month, quarter, year
}

impl Timeline {
    /**
      获取分时图
      例如: https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_minute_ab&query=588710&code=588710&market_type=ab&newFormat=1&name=%E5%8D%8E%E6%B3%B0%E6%9F%8F%E7%91%9E%E4%B8%8A%E8%AF%81%E7%A7%91%E5%88%9B%E6%9D%BF%E5%8D%8A%E5%AF%BC%E4%BD%93%E6%9D%90%E6%96%99%E8%AE%BE%E5%A4%87%E4%B8%BB%E9%A2%98ETF&is_kc=1&finClientType=pc&financeType=etf&finClientType=pc
    **/
    pub async fn get_data(args: &Args) -> Result<HttpResponse, String> {
        if args.market.is_empty() {
            return Ok(crate::prepare::get_error_response("`market` is empty !"));
        }

        if args.code.is_empty() {
            return Ok(crate::prepare::get_error_response("`code` is empty !"));
        }

        if args._type.is_empty() {
            return Ok(crate::prepare::get_error_response("`type` is empty !"));
        }

        if args.query_type.is_empty() {
            return Ok(crate::prepare::get_error_response("`queryType` is empty !"));
        }

        let mut url = format!(
            "{}vapi/v1/getquotation?pointType=string&group=quotation_{}_{}&query={}&code={}&market_type={}&newFormat=1&is_kc=1&finClientType=pc&financeType={}&finClientType=pc",
            BD_HTTP_URL_PREFIX, args.query_type, args.market, args.code, args.code, args.market, args._type
        );

        if args.query_type == "kline" {
            url = format!("{}&ktype={}", url, args.ktype);
        }

        info!("{} get time url {} .", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }
}
