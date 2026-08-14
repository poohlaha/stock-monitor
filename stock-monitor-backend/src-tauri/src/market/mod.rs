/*!
  市场
*/

use crate::prepare::HttpResponse;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use colored::Colorize;
use log::info;
use serde::{Deserialize, Serialize};
use std::fmt::Display;

pub mod detail;

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

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum HotStockType {
    /// 热股
    Stock,
    /// 热搜
    Search,
    /// 版块
    Plate,
    /// 舆情
    Sentiment,
    /// 诊股
    Analysis,
    /// 机构
    Institution,
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
        // info!("{} query market status url {}", LOGGER_PREFIX.cyan().bold(), url);

        Utils::get_time_response(&url).await
    }

    /**
      获取全球市场数据
      例: https://finance.pae.baidu.com/api/getbanner?market=&finClientType=pc
    */
    pub async fn query_worldwide(market: &str) -> Result<HttpResponse, String> {
        let url = format!("{}api/getbanner?market={}&finClientType=pc", BD_HTTP_URL_PREFIX, market);
        // info!("{} query market status url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
       获取行情中心(全球)
       例: https://finance.pae.baidu.com/vapi/index/overview?finClientType=pc
    */
    pub async fn query_worldwide_market_center() -> Result<HttpResponse, String> {
        let url = format!("{}vapi/index/overview?finClientType=pc", BD_HTTP_URL_PREFIX);
        // info!("{} query market status url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
      获取热门板块
      例: https://finance.pae.baidu.com/vapi/v1/blocks/overview?hasTrend=1&market=ab&finClientType=pc
    */
    pub async fn query_popular_section(market: &str) -> Result<HttpResponse, String> {
        let url = format!("{}vapi/v1/blocks/overview?hasTrend=1&market={}&finClientType=pc", BD_HTTP_URL_PREFIX, market);
        info!("{} query market status url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
      获取产业链
      例: https://finance.pae.baidu.com/sapi/v1/industry-chain/overview?finClientType=pc
    */
    pub async fn query_industrial_chain() -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/industry-chain/overview?finClientType=pc", BD_HTTP_URL_PREFIX);
        // info!("{} query market status url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
      查询经济指标
      例: https://finance.pae.baidu.com/sapi/v1/financelsegmacro/heatmap?from=home_page&finClientType=pc
    */
    pub async fn query_economic_indicators() -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/financelsegmacro/heatmap?from=&finClientType=pc", BD_HTTP_URL_PREFIX);
        // info!("{} query economic indicators url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
      查询热门指标
      例: https://finance.pae.baidu.com/sapi/v1/financelsegmacro/hotmetrics?country=世界&finClientType=pc
    */
    pub async fn query_hot_indicators(name: &str) -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/financelsegmacro/hotmetrics?country={}&finClientType=pc", BD_HTTP_URL_PREFIX, name);
        // info!("{} query hot indicators url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
      行业资金流向
      例: https://finance.pae.baidu.com/vapi/v1/fundflow?finance_type=stock&fund_flow_type=&market=ab&code=300502&type=stock&finClientType=pc
    */
    pub async fn query_industry_fund_flow(args: &Args, flow_type: &str) -> Result<HttpResponse, String> {
        if args.market.is_empty() {
            return Ok(crate::prepare::get_error_response("`market` is empty !"));
        }

        if args.code.is_empty() {
            return Ok(crate::prepare::get_error_response("`code` is empty !"));
        }

        let url = format!(
            "{}/vapi/v1/fundflow?finance_type=stock&fund_flow_type={}&market={}&code={}&type=stock&finClientType=pc",
            BD_HTTP_URL_PREFIX, flow_type, args.market, args.code
        );
        Utils::get_time_response(&url).await
    }

    /**
      股票相关新闻
      例: https://finance.pae.baidu.com/vapi/sentimentlist?market=ab&code=300502&query=300502&financeType=stock&benefitType=&pn=0&rn=30&finClientType=pc
    */
    pub async fn query_news(args: &Args) -> Result<HttpResponse, String> {
        let url = format!(
            "{}/vapi/sentimentlist?market={}&code={}&query={}&financeType=stock&benefitType=&pn=0&rn=30&finClientType=pc",
            BD_HTTP_URL_PREFIX, args.market, args.code, args.code
        );
        Utils::get_time_response(&url).await
    }

    /**
      公司介绍
      例: https://finance.pae.baidu.com/vapi/v1/overviewwidget?market=ab&code=300502&financeType=stock&modules=basicinfo&finClientType=pc
    */
    pub async fn query_company_info(args: &Args) -> Result<HttpResponse, String> {
        let url = format!(
            "{}/vapi/v1/overviewwidget?market={}&code={}&financeType={}&modules=basicinfo&finClientType=pc",
            BD_HTTP_URL_PREFIX, args.market, args.code, args._type
        );
        Utils::get_time_response(&url).await
    }

    /**
      公司简况
      例: https://finance.pae.baidu.com/api/stockwidget?code=300502&market=ab&type=stock&widgetType=company&finClientType=pc
    */
    pub async fn query_company_profile(args: &Args) -> Result<HttpResponse, String> {
        let url = format!("{}/api/stockwidget?market={}&code={}&type={}&widgetType=company&finClientType=pc", BD_HTTP_URL_PREFIX, args.market, args.code, args._type);
        Utils::get_time_response(&url).await
    }

    /**
      高管变动
      例: https://finance.pae.baidu.com/selfselect/openapi?srcid=5539&code=300502&company_code=177279&inner_code=36563&group=leader_info&listedSector=6&finClientType=pc
      高管变动: leader_info
      股本股通: holder_equity
      持仓明细: holder_equity_detail
    */
    pub async fn query_executive_changes(args: &Args, company_code: &str, inner_code: &str, group: &str, hold_type: &str) -> Result<HttpResponse, String> {
        let mut url = format!(
            "{}/selfselect/openapi?srcid=5539&code={}&company_code={}&inner_code={}&group={}&listedSector=6&finClientType=pc",
            BD_HTTP_URL_PREFIX, args.code, company_code, inner_code, group
        );

        if group == "holder_equity_detail" {
            url = format!("{}&hold_type={}", url, hold_type)
        }

        Utils::get_time_response(&url).await
    }

    /**
      通过url查询数据
    */
    pub async fn query_by_url(url: &str) -> Result<HttpResponse, String> {
        Utils::get_time_response(&url).await
    }

    /**
      热股榜
      例:
       - 热股: https://finance.pae.baidu.com/vapi/v1/hotrank?tn=wisexmlnew&dsp=iphone&product=stock&style=tablelist&market=all&type=hour&day=20260813&hour=10&pn=0&rn=12&finClientType=pc
       - 热搜: https://finance.pae.baidu.com/selfselect/listsugrecomm?tn=wisexmlnew&dsp=iphone&product=search&style=tablelist&market=all&type=hour&day=20260813&hour=10&pn=0&rn=12&finClientType=pc
       - 版块: https://finance.pae.baidu.com/selfselect/listsugrecomm?tn=wisexmlnew&dsp=iphone&product=plate&style=tablelist&pn=0&rn=12&finClientType=pc
       - 舆情: https://finance.pae.baidu.com/vapi/sentimentrank?market=&financeType=&pn=0&rn=12&finClientType=pc
       - 诊股: https://finance.pae.baidu.com/vapi/v1/analysisrank?product=analysis&isNew=1&style=tablelist&market=ab&pn=0&rn=12&finClientType=pc
       - 机构: https://finance.pae.baidu.com/sapi/v1/getinsthotstock?holdingType=all&market=all&scene=default&pn=0&rn=12&finClientType=pc
    */
    pub async fn query_hot_stock_list(day: &str, hot_type: HotStockType, market: &str) -> Result<HttpResponse, String> {
        let mut url = String::new();

        url = match hot_type {
            HotStockType::Stock => {
                format!(
                    "{}vapi/v1/hotrank?tn=wisexmlnew&dsp=iphone&product=stock&style=tablelist&market=all&type=hour&day={}&hour=10&pn=0&rn=12&finClientType=pc",
                    BD_HTTP_URL_PREFIX, day
                )
            }
            HotStockType::Search => {
                format!(
                    "{}selfselect/listsugrecomm?tn=wisexmlnew&dsp=iphone&product=search&style=tablelist&market=all&type=hour&day={}&hour=10&pn=0&rn=12&finClientType=pc",
                    BD_HTTP_URL_PREFIX, day
                )
            }
            HotStockType::Plate => {
                format!("{}selfselect/listsugrecomm?tn=wisexmlnew&dsp=iphone&product=plate&style=tablelist&pn=0&rn=12&finClientType=pc", BD_HTTP_URL_PREFIX)
            }
            HotStockType::Sentiment => {
                format!("{}vapi/sentimentrank?market=&financeType=&pn=0&rn=12&finClientType=pc", BD_HTTP_URL_PREFIX)
            }
            HotStockType::Analysis => {
                format!("{}vapi/v1/analysisrank?product=analysis&isNew=1&style=tablelist&market={}&pn=0&rn=12&finClientType=pc", BD_HTTP_URL_PREFIX, market)
            }
            HotStockType::Institution => {
                format!("{}sapi/v1/getinsthotstock?holdingType=all&market={}&scene=default&pn=0&rn=12&finClientType=pc", BD_HTTP_URL_PREFIX, market)
            }
        };

        Utils::get_time_response(&url).await
    }

    /**
      获取财经日历
      例: https://finance.pae.baidu.com/sapi/v1/financecalendar?cate=economic_data&from=home_page&pn=0&rn=6&finClientType=pc
    */
    pub async fn query_financial_calendar() -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/financecalendar?cate=economic_data&from=home_page&pn=0&rn=6&finClientType=pc", BD_HTTP_URL_PREFIX);
        Utils::get_time_response(&url).await
    }

    /**
      查询涨跌分布
      例: https://finance.pae.baidu.com/sapi/v1/marketquote?bizType=chgdiagram&market=ab&finClientType=pc
    */
    pub async fn query_stock_rf_distribution(market: &str) -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/marketquote?bizType=chgdiagram&market={}&finClientType=pc", BD_HTTP_URL_PREFIX, market);
        Utils::get_time_response(&url).await
    }

    /**
      查询A|港|美股主力净流入
      例: https://finance.pae.baidu.com/sapi/v1/marketquote?bizType=fundflow&rn=12&market=ab&finClientType=pc
    */
    pub async fn query_main_money_in(market: &str) -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/marketquote?bizType=fundflow&rn=12&market={}&finClientType=pc", BD_HTTP_URL_PREFIX, market);
        Utils::get_time_response(&url).await
    }
    /**
      查询热力图
      例: https://finance.pae.baidu.com/vapi/v2/blocks?style=heatmap&market=ab&typeCode=HY&sortKey=amount&sortType=desc&pn=0&rn=20&finClientType=pc
    */
    pub async fn query_industry_hot(market: &str, sort_key: &str) -> Result<HttpResponse, String> {
        let url = format!("{}vapi/v2/blocks?style=heatmap&market={}&typeCode=HY&sortKey={}&sortType=desc&pn=0&rn=20&finClientType=pc", BD_HTTP_URL_PREFIX, market, sort_key);
        Utils::get_time_response(&url).await
    }

    /**
      查询排行
      例: https://finance.pae.baidu.com/sapi/v1/ranks?bizType=stock_rank&category=&market=ab&pn=0&rn=12&fieldsType=base&finClientType=pc
    */
    pub async fn query_stock_rank(market: &str) -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/ranks?bizType=stock_rank&category=&market={}&pn=0&rn=12&fieldsType=base&finClientType=pc", BD_HTTP_URL_PREFIX, market);
        Utils::get_time_response(&url).await
    }

    /**
      7 * 24 快讯
      例: https://finance.pae.baidu.com/selfselect/expressnews?rn=6&pn=0&tag=&finClientType=pc
    */
    pub async fn query_breaking_news(name: &str) -> Result<HttpResponse, String> {
        let mut url = format!("{}selfselect/expressnews?rn=6&pn=0&tag=&finClientType=pc", BD_HTTP_URL_PREFIX);
        if !name.is_empty() {
            url = format!("{}&tag={}", url, name);
        }
        Utils::get_time_response(&url).await
    }
}
