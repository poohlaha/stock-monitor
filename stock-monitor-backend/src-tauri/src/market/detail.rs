/*!
  市场股票、基金等详细信息
*/

use crate::market::{Args, MarketType};
use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
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
                BD_HTTP_URL_PREFIX, args.code, args._type.to_string(), args.market
            );
        }

        info!("{} query position distribution url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取简况(基本信息, 成立日期等)
    pub async fn query_brief(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args._type == MarketType::Etf  {
            url = format!("{}sapi/v1/basicinfo?code={}&financeType={}&market={}&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args._type, args.market);
        }

        info!("{} query brief url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取收益
    pub async fn query_income(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args._type == MarketType::Etf  {
            url = format!("{}sapi/v1/rating?code={}&financeType={}&market={}&bizType=all&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args._type, args.market);
        }

        info!("{} query income url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }
}
