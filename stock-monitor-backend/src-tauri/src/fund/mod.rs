/*!
  基金信息
*/

pub mod allocation;
pub mod curve;
pub mod factor;
pub mod history;
pub mod holding;
pub mod industry;
pub mod info;
pub mod manager;
pub mod price;
pub mod rate;
pub mod record;
pub mod stage;

use crate::asset::asset::{Asset, AssetArgs};
use crate::asset::tag::AssetTagArgs;
use crate::error::Error;
use crate::fund::allocation::{FundAssetAllocation, FundAssetAllocationArgs};
use crate::fund::curve::{FundCurve, FundNavCurveArgs, FundPerformanceCurveArgs, NavPeriod};
use crate::fund::factor::{FundFactor, FundFactorArgs};
use crate::fund::history::{FundScaleHistory, FundScaleHistoryArgs};
use crate::fund::holding::{FundHolding, FundHoldingArgs};
use crate::fund::industry::{FundIndustryAllocation, FundIndustryAllocationArgs};
use crate::fund::info::{FundInfo, FundInfoArgs};
use crate::fund::manager::{FundManager, FundManagerArgs, FundManagerRelationArgs};
use crate::fund::price::{FundPriceChange, FundPriceChangeArgs};
use crate::fund::rate::{FundRate, FundRateArgs, FundRateDetailArgs};
use crate::fund::record::{AssetSyncRecord, AssetSyncType};
use crate::fund::stage::{FundStagePerformance, FundStagePerformanceArgs};
use crate::market::detail::MarketDetailInfo;
use crate::prepare::{get_success_response, HttpResponse};
use crate::stock::variable::Args;
use crate::utils::handler::Handler;
use crate::utils::json::JsonUtils;
use crate::utils::Utils;
use crate::BD_HTTP_URL_PREFIX2;
use chrono::NaiveDate;
use rust_decimal::prelude::{FromPrimitive, ToPrimitive, Zero};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Period {
    Week1,
    Month1,
    Month3,
    Month6,
    Year1,
    Year2,
    Year3,
    Year5,
    Ytd,
    Since,
}

impl Period {
    pub fn as_str(&self) -> &'static str {
        match self {
            Period::Week1 => "1week",
            Period::Month1 => "1month",
            Period::Month3 => "3month",
            Period::Month6 => "6month",
            Period::Year1 => "1year",
            Period::Year2 => "2year",
            Period::Year3 => "3year",
            Period::Year5 => "5year",
            Period::Ytd => "ytd",
            Period::Since => "since",
        }
    }
}

pub struct Fund {}

impl Fund {
    /*
     获取基金的信息, 包括名称、标签、涨跌幅、基金经理、收益等
     例: https://finance.baidu.com/opendata?query=021528&resource_id=5803&finClientType=pc
    */
    pub async fn query_info(args: &Args) -> Result<HttpResponse, String> {
        let url = format!("{}opendata?query={}&resource_id=5803&finClientType=pc", BD_HTTP_URL_PREFIX2, args.code);
        let data = Utils::get_response(&url).await?;
        // 资产信息, 从 tplData -> result 中取
        let list = JsonUtils::get_array_index(&data, 0);
        let result = JsonUtils::get_path(&list, &["DisplayData", "resultData", "tplData", "result"]).unwrap_or(&Value::Null);
        if JsonUtils::is_empty(result) {
            return Ok(get_success_response(None));
        }

        // 插入资产
        let asset_id = Self::insert_asset_data(args, result).await?;

        let mut need_update_sync = true;
        if !asset_id.is_empty() {
            // 插入涨跌幅
            let price_change_ok = Self::insert_price_change(&asset_id, result).await?;

            // 插入因子数据
            let factor_ok = Self::insert_factor(&asset_id, result).await?;

            // 插入基金阶段表现
            let stage_ok = Self::insert_stage(&asset_id, result).await?;

            // 插入基金规模历史、持仓明细
            let holding_ok = Self::insert_allocation_history_holding(&asset_id, result).await?;

            // 插入基金经理
            let manager_ok = Self::insert_manager(&asset_id, result).await?;

            // 插入费率
            let rate_ok = Self::insert_rate(&asset_id, result).await?;

            if !price_change_ok || !factor_ok || !stage_ok || !holding_ok || !manager_ok || !rate_ok {
                need_update_sync = false;
            }
        }

        if need_update_sync {
            // 插入成功后更新`同步记录表`
            AssetSyncRecord::update(&asset_id, AssetSyncType::Fund.as_str()).await?;
        }

        // 插入业绩走势曲线
        let _ = MarketDetailInfo::query_fund_graph(&args.code, "ai", "").await;

        // 组装数据
        Self::query_fund_info(&asset_id).await
    }

    // 插入资产信息
    pub async fn insert_asset_data(args: &Args, result: &Value) -> Result<String, String> {
        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let time = handlers::utils::Utils::get_date(None);
        let exchange = args.exchange.as_deref().unwrap_or("");

        // 1. 资产
        let asset_args = AssetArgs {
            id: None,
            code: args.code.to_string(),
            name: JsonUtils::get_string(result, "title"),
            asset_type: args.market_type.as_str().to_string(),
            market: args.market.to_string(),
            exchange: exchange.to_string(),
            disclosure: None,
            logo: None,
            create_time: Some(time.clone()),
            update_time: None,
        };

        // 2. 标签
        let descriptions = JsonUtils::get_array_by_key(result, "descriptions");
        let mut asset_tag_args_list = Vec::new();

        if !descriptions.is_empty() {
            for item in descriptions {
                if let Some(name) = item.as_str() {
                    asset_tag_args_list.push(AssetTagArgs {
                        id: None,
                        name: name.to_string(),
                        tag_type: "".to_string(),
                        img: "".to_string(),
                        create_time: Some(time.clone()),
                        update_time: None,
                    });
                }
            }
        }

        Asset::insert(asset_args, asset_tag_args_list).await
    }

    // 插入涨跌幅
    pub async fn insert_price_change(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let recent_list = JsonUtils::get_array_by_key(result, "recent");
        if recent_list.is_empty() {
            return Err(Error::Error(String::from("`recent` is empty!")).to_string());
        }

        let mut args_list: Vec<FundPriceChangeArgs> = Vec::new();

        for recent in recent_list {
            let price_change = JsonUtils::get_string(&recent, "value").trim_end_matches('%').parse::<Decimal>().unwrap_or(Decimal::zero());
            let name = JsonUtils::get_string(&recent, "text");
            let period = FundPriceChange::get_change_period(&name);
            let period = if period.is_none() { String::new() } else { period.unwrap().as_str().to_string() };
            args_list.push(FundPriceChangeArgs {
                id: None,
                asset_id: asset_id.to_string(),
                name,
                period,
                price_change,
                create_time: None,
                update_time: None,
            })
        }

        FundPriceChange::batch_add(asset_id, args_list).await
    }

    // 插入因子: 波动率，最大回撤，夏普比例
    pub async fn insert_factor(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let feature = JsonUtils::get_path(&result, &["content", "feature"]).unwrap_or(&Value::Null);
        if feature.is_null() {
            return Err(Error::Error(String::from("`feature` is empty!")).to_string());
        }

        let feature_list = JsonUtils::get_array_by_key(feature, "list");

        let mut args_list: Vec<FundFactorArgs> = Vec::new();
        for feature in feature_list {
            let value = JsonUtils::get_string(&feature, "value").trim_end_matches('%').parse::<Decimal>().unwrap_or(Decimal::zero());
            let name = JsonUtils::get_string(&feature, "text");

            let period = match FundFactor::parse_period(&name) {
                Some(v) => v.as_str().to_string(),
                None => continue,
            };
            let factor_type = match FundFactor::get_factor_type(&name) {
                Some(v) => v.as_str().to_string(),
                None => continue,
            };

            args_list.push(FundFactorArgs {
                id: None,
                asset_id: asset_id.to_string(),
                period,
                factor_type,
                factor_name: name,
                factor_value: value,
                create_time: None,
                update_time: None,
            })
        }

        FundFactor::batch_add(asset_id, args_list).await
    }

    // 插入基金阶段表现: 同类平均涨幅, 同类排名, 同类总数
    pub async fn insert_stage(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let stage_increase = JsonUtils::get_path(&result, &["content", "stageIncrease"]).unwrap_or(&Value::Null);
        if stage_increase.is_null() {
            return Err(Error::Error(String::from("`stageIncrease` is empty!")).to_string());
        }

        let body = JsonUtils::get_array_by_key(&stage_increase, "body");
        if body.is_empty() {
            return Ok(false);
        }

        let mut args_list = Vec::new();
        for row in body {
            let array = match row.as_array() {
                Some(v) => v,
                None => continue,
            };

            if array.is_empty() {
                continue;
            }

            if array.len() < 4 {
                continue;
            }

            let period_name = array[0].as_str().unwrap_or("").to_string();
            let price_change = array[1].as_str().map(Handler::parse_percent).unwrap_or_default();

            let average_change = array[2].as_str().map(Handler::parse_percent).unwrap_or_default();

            let rank_text = array[3].as_str().unwrap_or("");

            let mut rank_num = 0;
            let mut rank_total = 0;

            if rank_text.contains('|') {
                let ranks: Vec<&str> = rank_text.split('|').collect();
                rank_num = ranks.first().and_then(|v| v.parse::<i32>().ok()).unwrap_or(0);
                rank_total = ranks.get(1).and_then(|v| v.parse::<i32>().ok()).unwrap_or(0);
            }

            let period = FundStagePerformance::get_stage_period(period_name.as_str());
            if period.is_empty() {
                continue;
            }
            args_list.push(FundStagePerformanceArgs {
                id: None,
                asset_id: asset_id.to_string(),
                period,
                price_change,
                average_change,
                rank_num: Some(rank_num),
                rank_total: Some(rank_total),
                create_time: None,
                update_time: None,
            });
        }

        FundStagePerformance::batch_add(asset_id, args_list).await
    }

    pub async fn insert_allocation_history_holding(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let content = JsonUtils::get_path(&result, &["content"]).unwrap_or(&Value::Null);
        if content.is_null() {
            return Err(Error::Error(String::from("`content` is empty!")).to_string());
        }

        let tabs = JsonUtils::get_array_by_key(content, "tabs");
        if tabs.is_empty() {
            return Err(Error::Error(String::from("`tabs` is empty!")).to_string());
        }

        let position = JsonUtils::get_array_object_by_field(&tabs, "type", "position");
        if position.is_none() {
            return Err(Error::Error(String::from("`position` is empty!")).to_string());
        }

        let position = position.unwrap();

        // 插入基金资产配置: 股票/占比, 债券/占比 等
        let fund_positon = JsonUtils::get_path(&position, &["content", "fundPositon"]).unwrap_or(&Value::Null);
        let _ = Self::insert_allocation(asset_id, fund_positon).await?;

        // 插入基金规模历史: 基金规模、净资产规模等
        let fund_scale = JsonUtils::get_path(&position, &["content", "fundScale"]).unwrap_or(&Value::Null);
        let _ = Self::insert_scale_history(asset_id, fund_scale).await?;

        // 插入持仓明细(债券)
        let heavy_bond = JsonUtils::get_path(&position, &["content", "heavyBond"]).unwrap_or(&Value::Null);
        let _ = Self::insert_bond_holding(asset_id, heavy_bond).await?;

        // 插入持仓明细(股票)
        let heavy_stock = JsonUtils::get_path(&position, &["content", "heavyStock"]).unwrap_or(&Value::Null);
        let _ = Self::insert_stock_holding(asset_id, heavy_stock).await?;

        // 插入行业持仓配置
        let industry_positon = JsonUtils::get_path(&position, &["content", "industryPositon"]).unwrap_or(&Value::Null);
        if industry_positon.is_null() {
            return Ok(true);
        }

        let _ = Self::insert_industry_positon(asset_id, industry_positon, fund_positon).await?;

        // 基金信息
        let view = JsonUtils::get_array_object_by_field(&tabs, "type", "view");
        if view.is_none() {
            return Err(Error::Error(String::from("`view` is empty!")).to_string());
        }

        let view = view.unwrap();

        // 插入基金信息扩展
        let basic_info = JsonUtils::get_path(&view, &["content", "basicInfo"]).unwrap_or(&Value::Null);
        let newest = JsonUtils::get_array_by_key(&result, "newest");
        let _ = Self::insert_info(asset_id, basic_info, newest).await?;

        Ok(true)
    }

    // 插入基金资产配置: 股票/占比, 债券/占比 等
    pub async fn insert_allocation(asset_id: &str, fund_positon: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if fund_positon.is_null() {
            return Err(Error::Error(String::from("`fundPositon` is empty!")).to_string());
        }

        let list = JsonUtils::get_array_by_key(&fund_positon, "list");
        if list.is_empty() {
            return Err(Error::Error(String::from("`list` is empty!")).to_string());
        }

        let report_date = JsonUtils::get_string(&fund_positon, "date");

        let mut args_list = Vec::new();

        for row in list {
            let obj = match row.as_object() {
                Some(v) => v,
                None => continue,
            };

            let text = obj.get("text").and_then(|v| v.as_str()).unwrap_or("");
            let value = obj.get("value").and_then(|v| v.as_str()).unwrap_or("");

            let asset_type = match text {
                "股票" => "stock",
                "债券" => "bond",
                "现金" => "cash",
                _ => continue,
            };

            let proportion = value.trim_end_matches('%').parse::<Decimal>().unwrap_or_default();

            args_list.push(FundAssetAllocationArgs {
                id: None,
                asset_id: asset_id.to_string(),
                asset_type: asset_type.to_string(),
                asset_type_name: text.to_string(),
                proportion,
                report_date: report_date.clone(),
                create_time: None,
                update_time: None,
            });
        }

        FundAssetAllocation::batch_add(args_list).await
    }

    // 插入基金规模历史: 基金规模、净资产规模等
    pub async fn insert_scale_history(asset_id: &str, fund_scale: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if fund_scale.is_null() {
            return Err(Error::Error(String::from("`fundScale` is empty!")).to_string());
        }

        let mut args_list = Vec::new();

        let list = JsonUtils::get_array_by_key(fund_scale, "list");
        if list.is_empty() && args_list.is_empty() {
            return Err(Error::Error(String::from("`list` is empty!")).to_string());
        }

        let report_date = JsonUtils::get_string(fund_scale, "updateDate");
        let info_list: Vec<Value> = list.iter().flat_map(|item| JsonUtils::get_array_by_key(item, "info")).collect();

        for item in info_list {
            let row_obj = match item.as_object() {
                Some(v) => v,
                None => continue,
            };

            if row_obj.is_empty() {
                continue;
            }

            let name = row_obj.get("date").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let value = row_obj.get("value").and_then(|v| v.as_str()).unwrap_or("0");
            let scale = value.parse::<Decimal>().unwrap_or_default();
            let period_sort = FundScaleHistory::period_to_sort(&name);

            args_list.push(FundScaleHistoryArgs {
                id: None,
                asset_id: asset_id.to_string(),
                name,
                scale,
                net_asset: Default::default(),
                report_date: report_date.clone(),
                period_sort,
                create_time: None,
                update_time: None,
            })
        }

        FundScaleHistory::batch_add(asset_id, args_list).await
    }

    // 插入持仓明细(债券): 25国债13: 1.8100%
    pub async fn insert_bond_holding(asset_id: &str, heavy_bond: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if heavy_bond.is_null() {
            return Ok(false);
        }

        let body = JsonUtils::get_array_by_key(heavy_bond, "body");
        if body.is_empty() {
            return Ok(false);
        }

        let report_date = heavy_bond.get("titleHeader").and_then(|v| v.as_array()).and_then(|arr| arr.get(1)).and_then(|v| v.as_str()).unwrap_or("").to_string();

        let mut args_list = Vec::new();

        for row in body {
            let array = match row.as_array() {
                Some(v) => v,
                None => continue,
            };

            if array.len() < 2 {
                continue;
            }

            let target_name = array[0].as_str().unwrap_or("").to_string();
            let proportion = Handler::parse_percent(array[1].as_str().unwrap_or(""));

            args_list.push(FundHoldingArgs {
                id: None,
                asset_id: asset_id.to_string(),
                holding_type: "bond".to_string(),
                target_code: target_name.clone(),
                target_name,
                market: "".to_string(),
                proportion,
                price_change: None,
                report_date: report_date.clone(),
                create_time: None,
                update_time: None,
            });
        }

        FundHolding::batch_add(asset_id, args_list, "bond").await
    }

    // 插入持仓明细(股票)
    pub async fn insert_stock_holding(asset_id: &str, heavy_stock: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if heavy_stock.is_null() {
            return Ok(false);
        }

        let body = JsonUtils::get_array_by_key(heavy_stock, "body");
        if body.is_empty() {
            return Ok(false);
        }

        let report_date = heavy_stock.get("titleHeader").and_then(|v| v.as_array()).and_then(|arr| arr.get(1)).and_then(|v| v.as_str()).unwrap_or("").to_string();

        let mut args_list = Vec::new();
        for row in body {
            let obj = match row.as_object() {
                Some(v) => v,
                None => continue,
            };

            let name = obj.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let code = obj.get("code").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let market = obj.get("market").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let price_change = Handler::parse_percent(obj.get("proportionRatio").and_then(|v| v.as_str()).unwrap_or(""));
            let proportion = Handler::parse_percent(obj.get("positionProportion").and_then(|v| v.as_str()).unwrap_or(""));

            args_list.push(FundHoldingArgs {
                id: None,
                asset_id: asset_id.to_string(),
                holding_type: "stock".to_string(),
                target_code: code,
                target_name: name,
                market,
                proportion,
                price_change: Some(price_change),
                report_date: report_date.clone(),
                create_time: None,
                update_time: None,
            });
        }

        FundHolding::batch_add(asset_id, args_list, "stock").await
    }

    // 插入行业持仓配置
    pub async fn insert_industry_positon(asset_id: &str, industry_positon: &Value, fund_positon: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if industry_positon.is_null() {
            return Err(Error::Error(String::from("`heavyStock` is empty!")).to_string());
        }

        let list = JsonUtils::get_array_by_key(industry_positon, "list");
        if list.is_empty() {
            return Err(Error::Error(String::from("`list` is empty!")).to_string());
        }

        let report_date = JsonUtils::get_string(&fund_positon, "date");

        let mut args_list = Vec::new();
        for row in list {
            let obj = match row.as_object() {
                Some(v) => v,
                None => continue,
            };

            let industry_name = obj.get("text").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let proportion = Handler::parse_percent(obj.get("value").and_then(|v| v.as_str()).unwrap_or(""));

            args_list.push(FundIndustryAllocationArgs {
                id: None,
                asset_id: asset_id.to_string(),
                industry_name,
                proportion,
                report_date: report_date.clone(),
                create_time: None,
                update_time: None,
            });
        }

        FundIndustryAllocation::batch_add(asset_id, args_list).await
    }

    // 插入基金信息扩展: 基金类型, 基金公司, 基金托管人等
    pub async fn insert_info(asset_id: &str, basic_info: &Value, newest: Vec<Value>) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if basic_info.is_null() {
            return Err(Error::Error(String::from("`basicInfo` is empty!")).to_string());
        }

        let list = JsonUtils::get_array_by_key(basic_info, "list");
        if list.is_empty() {
            return Err(Error::Error(String::from("`list` is empty!")).to_string());
        }

        let mut latest_nav = None;
        let mut latest_nav_date = None;
        let mut latest_change = None;

        for item in newest {
            let text = item.get("text").and_then(|v| v.as_str()).unwrap_or("");
            let value = item.get("value").and_then(|v| v.as_str()).unwrap_or("");

            if text.starts_with("日涨幅") {
                // -5.01%
                let change = value.replace("%", "").replace("+", "").parse::<Decimal>().unwrap_or_default();
                latest_change = Some(change);

                // 获取日期
                // 日涨幅(08-24)
                if let Some(date) = text.split('(').nth(1).and_then(|v| v.strip_suffix(')')) {
                    latest_nav_date = Some(date.to_string());
                }
            } else if text == "净值" {
                let nav = value.parse::<Decimal>().unwrap_or_default();
                latest_nav = Some(nav);
            }
        }

        let mut args_list = Vec::new();
        let mut args = FundInfoArgs {
            id: None,
            asset_id: asset_id.to_string(),
            fund_code: "".to_string(),
            fund_full_name: "".to_string(),
            fund_company: String::new(),
            custodian: String::new(),
            benchmark: String::new(),
            establish_date: String::new(),
            fund_scale: None,
            investment_target: String::new(),
            investment_strategy: String::new(),
            latest_nav,
            latest_nav_date,
            latest_change,
            create_time: None,
            update_time: None,
            fund_type: "".to_string(),
            fund_scale_text: None,
        };

        for item in list {
            let text = item.get("text").and_then(|v| v.as_str()).unwrap_or("");
            let value = item.get("value").and_then(|v| v.as_str()).unwrap_or("");
            match text {
                "基金全称" => {
                    args.fund_full_name = value.to_string();
                }
                "基金类型" => {
                    args.fund_type = value.to_string();
                }
                "基金规模" => {
                    args.fund_scale = Self::parse_cn_amount(value);
                }
                "基金代码" => {
                    args.fund_code = value.to_string();
                }
                "基金公司" => {
                    args.fund_company = value.to_string();
                }
                "基金托管人" => {
                    args.custodian = value.to_string();
                }
                "业绩基准" => {
                    args.benchmark = value.to_string();
                }
                "成立日期" => {
                    args.establish_date = value.to_string();
                }
                "投资目标" => {
                    args.investment_target = value.to_string();
                }
                "投资策略" => {
                    args.investment_strategy = value.to_string();
                }
                _ => {}
            }
        }

        args_list.push(args);

        FundInfo::batch_add(args_list).await
    }

    // 插入基金经理
    pub async fn insert_manager(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let fund_manger_list = JsonUtils::get_array_by_key(&result, "fundMangerList");

        let mut manager_args_list: Vec<FundManagerArgs> = Vec::new();
        let mut relation_args_list: Vec<FundManagerRelationArgs> = Vec::new();

        let time = handlers::utils::Utils::get_date(None);
        for manager in fund_manger_list {
            let obj = match manager.as_object() {
                Some(v) => v,
                None => continue,
            };

            let manager_code = obj.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let manager_id = Uuid::new_v4().to_string();
            manager_args_list.push(FundManagerArgs {
                id: Some(manager_id.clone()),
                manager_code,
                name: obj.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                avatar: obj.get("avatar").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                company: obj.get("corpName").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                description: obj.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                resume: obj.get("managerResume").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                working_years: Handler::parse_decimal(obj.get("workingYears").and_then(|v| v.as_str()).unwrap_or("")),
                manage_scale: Handler::parse_decimal(obj.get("manageScale").and_then(|v| v.as_str()).unwrap_or("")),
                earning_rate: Handler::parse_decimal(obj.get("earningRate").and_then(|v| v.as_str()).unwrap_or("")),
                average_return: Handler::parse_decimal(obj.get("aveAnn").and_then(|v| v.as_str()).unwrap_or("")),
                max_drawdown: Handler::parse_decimal(obj.get("maxDrawdown").and_then(|v| v.as_str()).unwrap_or("")),
                top_report: Handler::parse_decimal(obj.get("topReport").and_then(|v| v.as_str()).unwrap_or("")),
                create_time: Some(time.clone()),
                update_time: None,
            });

            // 在管基金
            let in_manage = obj.get("inManageFunds").and_then(|v| v.as_array());
            if in_manage.is_none() {
                continue;
            }

            if let Some(in_manage) = in_manage {
                for fund in in_manage {
                    relation_args_list.push(Self::build_manager_relation(&manager_id, asset_id, fund, 1, &time));
                }
            }

            // 离任基金
            let out_manage = obj.get("outManageFunds").and_then(|v| v.as_array());
            if let Some(out_manage) = out_manage {
                for fund in out_manage {
                    relation_args_list.push(Self::build_manager_relation(&manager_id, asset_id, fund, 2, &time));
                }
            }
        }

        FundManager::batch_add(asset_id, manager_args_list, relation_args_list).await
    }

    // 插入费率
    pub async fn insert_rate(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let fund_rate = JsonUtils::get_path(&result, &["fundRate"]).unwrap_or(&Value::Null);
        if fund_rate.is_null() {
            return Err(Error::Error(String::from("`fundRate` is empty!")).to_string());
        }

        let fund_rate_list = JsonUtils::get_array_by_key(&fund_rate, "items");
        if fund_rate_list.is_empty() {
            return Err(Error::Error(String::from("`items` is empty!")).to_string());
        }

        let mut args_list: Vec<FundRateArgs> = Vec::new();
        let mut detail_args_list: Vec<FundRateDetailArgs> = Vec::new();

        let time = handlers::utils::Utils::get_date(None);
        for item in fund_rate_list {
            let rate_type = item.get("fundType").and_then(|v| v.as_str()).unwrap_or("").to_string();

            let rate_id = Uuid::new_v4().to_string();
            args_list.push(FundRateArgs {
                id: Some(rate_id.clone()),
                asset_id: asset_id.to_string(),
                rate_type,
                rate_desc: item.get("fundTypeDesc").and_then(|v| v.as_str()).map(|v| v.to_string()),
                create_time: Some(time.clone()),
                update_time: None,
            });

            let sub_list = item.get("subFundRateInfo").and_then(|v| v.as_array());

            if sub_list.is_none() {
                continue;
            }

            if let Some(sub_list) = sub_list {
                if sub_list.is_empty() {
                    continue;
                }

                for sub in sub_list {
                    detail_args_list.push(FundRateDetailArgs {
                        id: Some(Uuid::new_v4().to_string()),
                        rate_id: rate_id.clone(),
                        rate_measure: sub["rateMeasure"].as_str().unwrap_or("").to_string(),
                        unit_rate: Handler::parse_decimal(sub["unitRate"].as_str().unwrap_or("")),
                        description: sub["desc"].as_str().unwrap_or("").to_string(),
                        create_time: Some(time.clone()),
                        update_time: None,
                    })
                }
            }
        }

        FundRate::batch_add(args_list, detail_args_list).await
    }

    // 插入业绩走势
    pub async fn insert_performance_curve(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let mut series: Vec<Value> = Vec::new();

        let tabs = JsonUtils::get_array_by_key(&result, "tabs");
        if !tabs.is_empty() {
            let tab = tabs.get(0).unwrap_or(&Value::Null);

            if tab.is_null() {
                return Err(Error::Error(String::from("`tab` is empty!")).to_string());
            }

            series = JsonUtils::get_array_by_key(&tab, "series");
        } else {
            series = JsonUtils::get_array_by_key(&result, "series");
        }

        if series.is_empty() {
            return Err(Error::Error(String::from("`series` is empty!")).to_string());
        }

        let mut args_list: Vec<FundPerformanceCurveArgs> = Vec::new();

        for item in series {
            let name = item["name"].as_str().unwrap_or("");
            let value_str = item["value"].as_str().unwrap_or("");
            let series_type = match name {
                "本基金" => "fund",
                "同类平均" => "average",
                "沪深300" => "index",
                _ => continue,
            };

            for point in value_str.split(";") {
                let mut parts = point.split(",");

                let report_date_str = parts.next().unwrap_or("").trim();
                let value = parts.next().unwrap_or("").replace("%", "").replace("+", "");

                if report_date_str.is_empty() {
                    continue;
                }

                let report_date = match NaiveDate::parse_from_str(report_date_str, "%Y-%m-%d") {
                    Ok(date) => date,
                    Err(_) => continue,
                };

                args_list.push(FundPerformanceCurveArgs {
                    id: None,
                    asset_id: asset_id.to_string(),
                    series_type: series_type.to_string(),
                    report_date,
                    value: Handler::parse_decimal(&value),
                    create_time: None,
                    update_time: None,
                });
            }
        }

        FundCurve::batch_performance_add(asset_id, args_list).await
    }

    // 插入净值曲线
    pub async fn insert_nav_curve(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        if result.is_null() {
            return Err(Error::Error(String::from("`result` is empty!")).to_string());
        }

        let series = JsonUtils::get_array_by_key(&result, "series");
        if series.is_empty() {
            return Err(Error::Error(String::from("`series` is empty!")).to_string());
        }

        let value = series[0]["value"].as_str().unwrap_or("");

        let mut args_list: Vec<FundNavCurveArgs> = Vec::new();
        for item in value.split(";") {
            let fields: Vec<&str> = item.split(",").collect();
            if fields.len() < 4 {
                continue;
            }

            let report_date_str = fields[0].to_string();
            let unit_nav = fields[1].parse::<Decimal>().unwrap_or_default();
            let day_change = fields[2].replace("%", "").replace("+", "").parse::<Decimal>().unwrap_or_default();
            let accumulated_nav = fields[3].parse::<Decimal>().unwrap_or_default();
            if report_date_str.is_empty() {
                continue;
            }

            let report_date = match NaiveDate::parse_from_str(&report_date_str, "%Y-%m-%d") {
                Ok(date) => date,
                Err(_) => continue,
            };

            args_list.push(FundNavCurveArgs {
                id: None,
                asset_id: asset_id.to_string(),
                unit_nav,
                day_change,
                accumulated_nav,
                report_date,
                create_time: None,
                update_time: None,
            });
        }

        FundCurve::batch_nav_add(asset_id, args_list).await
    }

    fn build_manager_relation(manager_id: &str, asset_id: &str, fund: &Value, manage_type: i8, time: &str) -> FundManagerRelationArgs {
        let period_return = fund.get("periodAnnReturn").and_then(|v| v.as_str()).unwrap_or("").replace("%", "").replace("+", "").parse::<Decimal>().unwrap_or_default();
        let manage_days = fund.get("manageDueDay").and_then(|v| v.as_str()).unwrap_or("").replace("天", "").parse::<i32>().unwrap_or(0);

        // 任职年限
        let period_years = Decimal::from(manage_days) / Decimal::from(365);

        // 任职收益
        let earning_rate = period_return;

        // 年化收益
        let yearly_return = if manage_days > 0 {
            let total_return = earning_rate.to_f64().unwrap_or(0.0) / 100.0;
            let years = manage_days as f64 / 365.0;
            let yearly = ((1.0 + total_return).powf(1.0 / years) - 1.0) * 100.0;
            Decimal::from_f64(yearly).unwrap_or_default()
        } else {
            Decimal::ZERO
        };

        let manage_period = fund.get("managePeriod").and_then(|v| v.as_str()).unwrap_or("");
        let (start_date, end_date) = Self::parse_manage_period(manage_period);

        FundManagerRelationArgs {
            id: Some(Uuid::new_v4().to_string()),
            asset_id: asset_id.to_string(),
            manager_id: manager_id.to_string(),
            fund_code: fund.get("fundCode").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            fund_name: fund.get("fundName").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            fund_type: fund.get("fundType").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            manage_type,
            start_date,
            end_date,
            manage_period: manage_period.to_string(),
            period_return,
            period_rank: fund.get("periodAnnRank").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            manage_days,
            period_years,
            earning_rate,
            yearly_return,
            report_date: time.to_string(),
            create_time: Some(time.to_string()),
            update_time: None,
        }
    }

    // 计算基金经理任职时间
    fn parse_manage_period(period: &str) -> (String, Option<String>) {
        let arr: Vec<&str> = period.split("--").collect();

        if arr.len() != 2 {
            return ("".to_string(), None);
        }

        let start = arr[0].trim().to_string();
        let end = arr[1].trim();
        let end_date = if end == "至今" || end.is_empty() { None } else { Some(end.to_string()) };

        (start, end_date)
    }

    // 统一转成亿元
    fn parse_cn_amount(value: &str) -> Option<Decimal> {
        let value = value.trim();

        if value.is_empty() {
            return None;
        }

        let mut num = Decimal::ZERO;

        if value.contains("万亿") {
            let v = value.replace("万亿", "");
            num = Decimal::from_str(&v).unwrap_or_default() * Decimal::from(10000);
        } else if value.contains("亿") {
            let v = value.replace("亿", "");
            num = Decimal::from_str(&v).unwrap_or_default();
        } else if value.contains("万") {
            let v = value.replace("万", "");
            num = Decimal::from_str(&v).unwrap_or_default() / Decimal::from(10000);
        } else {
            num = Decimal::from_str(value).unwrap_or_default();
        }

        Some(num)
    }

    // 查询所有信息
    pub async fn query_fund_info(asset_id: &str) -> Result<HttpResponse, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let asset = Asset::get_detail_by_id(asset_id).await?;
        let fund_info = FundInfo::get_by_asset_id(asset_id).await?;
        let price_change = FundPriceChange::get_by_asset_id(asset_id).await?;
        let factor = FundFactor::get_by_asset_id(asset_id).await?;
        let stage = FundStagePerformance::get_by_asset_id(asset_id).await?;
        let holding = FundHolding::get_by_asset_id(asset_id).await?;
        let manager = FundManager::get_by_asset_id(asset_id).await?;
        let allocation = FundAssetAllocation::get_by_asset_id(asset_id).await?;
        let industry = FundIndustryAllocation::get_by_asset_id(asset_id).await?;
        let history = FundScaleHistory::get_by_asset_id(asset_id).await?;
        let performance = FundCurve::query_performance(asset_id, &NavPeriod::Year1).await?;

        let result = json!({
            "basicInfo": asset,
            "fundInfo": fund_info,
            "priceChange": price_change,
            "factor": factor,
            "stage": stage,
            "holding": holding,
            "manager": manager,
            "allocation": allocation,
            "industry": industry,
            "history": history,
            "performance": performance,
        });

        Ok(get_success_response(Some(result)))
    }
}
