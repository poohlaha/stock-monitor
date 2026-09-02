/*!
  市场股票、基金等详细信息
*/

use crate::asset::asset::{Asset, AssetArgs};
use crate::error::Error;
use crate::fund::curve::{FundCurve, NavPeriod};
use crate::fund::record::AssetSyncType;
use crate::fund::Fund;
use crate::prepare::{get_success_response, HttpResponse};
use crate::stock::variable::{Args, MarketType};
use crate::stock::Stock;
use crate::utils::json::JsonUtils;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, BD_HTTP_URL_PREFIX2, LOGGER_PREFIX};
use log::info;
use serde_json::Value;

pub struct MarketDetailInfo {}

impl MarketDetailInfo {
    // 查询资产信息
    pub async fn query_info(args: &Args) -> Result<HttpResponse, String> {
        if args.code.is_empty() {
            return Ok(crate::prepare::get_error_response("`code` is empty !"));
        }

        if args.market_type.as_str().is_empty() {
            return Ok(crate::prepare::get_error_response("`type` is empty !"));
        }

        // 1. 查询资产信息
        let asset = Asset::get_by_code_type(&args.code, args.market_type.as_str()).await?;

        // 2. 如果已存在, 判断是否需要同步
        if let Some(asset) = asset {
            let asset_id = asset.id.unwrap_or_default();
            let need_sync = Asset::check_need_sync(&asset_id, args.market_type.as_str()).await?;

            if !need_sync {
                info!("{} query info not need sync ...", LOGGER_PREFIX);
                // 查询业绩走势
                let data = Self::query_asset_info(&asset_id, args).await?;
                return Ok(data);
            }
        }

        // 3. 不存在或都需要同步
        match args.market_type {
            MarketType::Fund => Fund::query_info(args).await,
            MarketType::Stock | MarketType::Etf => Stock::query_info(args).await,
            MarketType::Unknown => Err(Error::Error(String::from("unknow asset type")).to_string()),
        }
    }

    async fn query_asset_info(asset_id: &str, args: &Args) -> Result<HttpResponse, String> {
        match args.market_type {
            MarketType::Fund => Fund::query_fund_info(asset_id).await,
            MarketType::Stock | MarketType::Etf => Stock::query_stock_info(asset_id, args, None).await,
            MarketType::Unknown => Err(Error::Error(String::from("unknow asset type")).to_string()),
        }
    }

    // 查询持仓分布
    pub async fn query_position_distribution(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args.market_type == MarketType::Etf {
            url = format!(
                "{}sapi/v1/constituents?code={}&financeType={}&market={}&bizType=etfDistribution&finClientType=pc",
                BD_HTTP_URL_PREFIX,
                args.code,
                args.market_type.as_str(),
                args.market
            );
        }

        // info!("{} query position distribution url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取简况(基本信息, 成立日期等)
    pub async fn query_brief(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args.market_type == MarketType::Etf {
            url = format!("{}sapi/v1/basicinfo?code={}&financeType={}&market={}&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args.market_type.as_str(), args.market);
        }

        // info!("{} query brief url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 获取收益
    pub async fn query_income(args: &Args) -> Result<HttpResponse, String> {
        let mut url = String::new();
        if args.market_type == MarketType::Etf {
            url = format!(
                "{}sapi/v1/rating?code={}&financeType={}&market={}&bizType=all&finClientType=pc",
                BD_HTTP_URL_PREFIX,
                args.code,
                args.market_type.as_str(),
                args.market
            );
        }

        // info!("{} query income url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    // 查询基金业绩走势和净值曲线
    pub async fn query_fund_graph(code: &str, name: &str, month: &str) -> Result<HttpResponse, String> {
        let asset: Option<AssetArgs> = Asset::get_by_code_type(code, AssetSyncType::Fund.as_str()).await?;

        let asset = match asset {
            Some(asset) => asset,
            None => {
                return Ok(crate::prepare::get_error_response("asset not found"));
            }
        };

        let asset_id = asset.id.unwrap_or_default();

        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let period = NavPeriod::from_month(month)?;

        match name {
            "ai" => {
                // 判断业绩走势是否存在
                let exists = FundCurve::check_performance_exists(&asset_id).await?;
                if exists {
                    info!("{} nav performance exists ...", LOGGER_PREFIX);
                    let list = FundCurve::query_performance(&asset_id, &period).await?;
                    if !list.is_empty() {
                        let value: Value = serde_json::to_value(list).map_err(|e| e.to_string())?;
                        return Ok(get_success_response(Some(value)));
                    }
                }
            }

            "nvl" => {
                // 判断净值曲线是否存在
                let exists = FundCurve::check_nav_exists(&asset_id).await?;
                if exists {
                    info!("{} nav has exists ...", LOGGER_PREFIX);
                    let list = FundCurve::query_nav(&asset_id, &period).await?;
                    if !list.is_empty() {
                        let value: Value = serde_json::to_value(list).map_err(|e| e.to_string())?;
                        return Ok(get_success_response(Some(value)));
                    }
                }
            }

            _ => {}
        }

        // 没有数据, 则请求接口
        let mut month = FundCurve::judge_month(&asset_id).await?;
        if month <= 0 {
            month = 9999;
        }

        let url = format!("{}opendata?query={}&resource_id=5824&finClientType=pc&t={}&m={}", BD_HTTP_URL_PREFIX2, code, name, month);
        let data = Utils::get_response(&url).await?;

        let list = JsonUtils::get_array_index(&data, 0);
        let result = JsonUtils::get_path(&list, &["DisplayData", "resultData", "tplData"]).unwrap_or(&Value::Null);
        if JsonUtils::is_empty(result) {
            return Ok(get_success_response(Some(data)));
        }

        match name {
            "ai" => {
                let _ = Fund::insert_performance_curve(&asset_id, &result).await?;
                let nav_list = FundCurve::query_performance(&asset_id, &period).await?;
                let value: Value = serde_json::to_value(nav_list).map_err(|e| e.to_string())?;
                Ok(get_success_response(Some(value)))
            }
            "nvl" => {
                let _ = Fund::insert_nav_curve(&asset_id, &result).await?;
                let nav_list = FundCurve::query_nav(&asset_id, &period).await?;
                let value: Value = serde_json::to_value(nav_list).map_err(|e| e.to_string())?;
                Ok(get_success_response(Some(value)))
            }
            _ => Ok(get_success_response(Some(data))),
        }
    }

    /**
     查询股评(浮动)
     例: https://finance.pae.baidu.com/sapi/v1/bulletscreen?financeType=stock&code=300502&market=ab&interval=120&finClientType=pc
    */
    pub async fn query_float_stock_commentary(args: &Args) -> Result<HttpResponse, String> {
        let url = format!("{}sapi/v1/bulletscreen?financeType=stock&code={}&market={}&interval=120&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args.market);
        // info!("{} query open data url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
     查询股票分析
     例: https://finance.pae.baidu.com/vapi/v1/overviewwidget?market=ab&code=300502&financeType=stock&modules=analysis&finClientType=pc
    */
    pub async fn query_stock_analysis(args: &Args) -> Result<HttpResponse, String> {
        let url = format!("{}vapi/v1/overviewwidget?code={}&market={}&financeType=stock&modules=analysis&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args.market);
        // info!("{} query open data url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }

    /**
      查询关联标的
      例: https://finance.pae.baidu.com/vapi/v1/stockrelatedobjects?market=ab&code=300502&type=stock&finClientType=pc
    */
    pub async fn query_related_targets(args: &Args) -> Result<HttpResponse, String> {
        let url = format!("{}vapi/v1/stockrelatedobjects?code={}&market={}&type=stock&finClientType=pc", BD_HTTP_URL_PREFIX, args.code, args.market);
        // info!("{} query open data url {}", LOGGER_PREFIX.cyan().bold(), url);
        Utils::get_time_response(&url).await
    }
}
