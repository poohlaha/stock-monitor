/*!
  市场股票、基金等详细信息
*/

use crate::market::{Args, MarketType};
use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, BD_HTTP_URL_PREFIX2, LOGGER_PREFIX};
use colored::Colorize;
use log::info;

pub struct MarketDetailInfo {}

impl MarketDetailInfo {
    // 查询持仓分布
    pub async fn query_position_distribution(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args._type == MarketType::Etf {
            url = format!(
                "{}sapi/v1/constituents?code={}&financeType={}&market={}&bizType=etfDistribution&finClientType=pc",
                BD_HTTP_URL_PREFIX,
                args.code,
                args._type.to_string(),
                args.market
            );
        }

        // info!("{} query position distribution url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取简况(基本信息, 成立日期等)
    pub async fn query_brief(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args._type == MarketType::Etf {
            url = format!("{}sapi/v1/basicinfo?code={}&financeType={}&market={}&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args._type, args.market);
        }

        // info!("{} query brief url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取收益
    pub async fn query_income(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args._type == MarketType::Etf {
            url = format!("{}sapi/v1/rating?code={}&financeType={}&market={}&bizType=all&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args._type, args.market);
        }

        // info!("{} query income url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取十大持仓等数据
    pub async fn query_open_data(code: &str) -> Result<HttpResponse, String> {
        let url = format!("{}opendata?query={}&resource_id=5803&finClientType=pc", BD_HTTP_URL_PREFIX2, code);
        info!("{} query open data url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 查询基金曲线
    pub async fn query_fund_graph(code: &str, name: &str, month: &str) -> Result<HttpResponse, String> {
        let url = format!("{}opendata?query={}&resource_id=5824&finClientType=pc&t={}&m={}", BD_HTTP_URL_PREFIX2, code, name, month);
        info!("{} query open data url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
    获取分时图
    例如: https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_minute_ab&query=588710&code=588710&market_type=ab&newFormat=1&name=%E5%8D%8E%E6%B3%B0%E6%9F%8F%E7%91%9E%E4%B8%8A%E8%AF%81%E7%A7%91%E5%88%9B%E6%9D%BF%E5%8D%8A%E5%AF%BC%E4%BD%93%E6%9D%90%E6%96%99%E8%AE%BE%E5%A4%87%E4%B8%BB%E9%A2%98ETF&is_kc=1&finClientType=pc&financeType=etf&finClientType=pc
    */
    pub async fn get_time_data(args: &Args) -> Result<HttpResponse, String> {
        if args.market.is_empty() {
            return Ok(crate::prepare::get_error_response("`market` is empty !"));
        }

        if args.code.is_empty() {
            return Ok(crate::prepare::get_error_response("`code` is empty !"));
        }

        if args.query_type.is_empty() {
            return Ok(crate::prepare::get_error_response("`queryType` is empty !"));
        }

        let mut url = format!(
            "{}vapi/v1/getquotation?pointType=string&group=quotation_{}_{}&query={}&code={}&market_type={}&newFormat=1&is_kc=1&finClientType=pc&financeType={}&finClientType=pc",
            BD_HTTP_URL_PREFIX,
            args.query_type,
            args.market,
            args.code,
            args.code,
            args.market,
            args._type.to_string(),
        );

        if args.query_type == "kline" {
            url = format!("{}&ktype={}", url, args.ktype);
        }

        // info!("{} get time url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }
}
