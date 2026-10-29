/*!
 资金分布、资金流向、所属行业资金流向
 stock_fund_flow 表
*/

use crate::asset::asset::Asset;
use crate::database::helper::DBHelper;
use crate::error::Error;
use crate::prepare::{get_success_response, HttpResponse};
use crate::stock::variable::Args;
use crate::utils::json::JsonUtils;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sqlx::{FromRow, MySql};
use std::collections::HashMap;
use std::str::FromStr;
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockFundFlowArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "flowType")]
    pub flow_type: String, // 周期类型：day/week/month

    #[serde(rename = "fundType")]
    pub fund_type: String, // 资金类型：main/retail

    #[serde(rename = "closePx")]
    pub close_px: Decimal, // 当日收盘价

    #[serde(rename = "date")]
    pub date: String, // 日期

    #[serde(rename = "netTurnover")]
    pub net_turnover: Decimal, // 净流入金额

    #[serde(rename = "turnoverIn")]
    pub turnover_in: Decimal, // 流入金额

    #[serde(rename = "turnoverOut")]
    pub turnover_out: Decimal, // 流出金额

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct StockFundFlow;

impl StockFundFlow {
    /*!
      查询资金分布
      例: GET https://finance.pae.baidu.com/vapi/v1/fundflow?finance_type=stock&fund_flow_type=&market=ab&code=300502&type=stock&finClientType=pc
    */
    pub async fn query_fund_distribution(args: &Args, fund_flow_type: Option<String>) -> Result<HttpResponse, String> {
        if args.market.is_empty() {
            return Ok(crate::prepare::get_error_response("`market` is empty !"));
        }

        if args.code.is_empty() {
            return Ok(crate::prepare::get_error_response("`code` is empty !"));
        }

        let flow_type = fund_flow_type.unwrap_or_default();
        let url = format!(
            "{}vapi/v1/fundflow?finance_type=stock&fund_flow_type={}&market={}&code={}&type=stock&finClientType=pc",
            BD_HTTP_URL_PREFIX, flow_type, args.market, args.code
        );
        if flow_type.is_empty() {
            return Utils::get_time_response(&url).await;
        }

        let response = Utils::get_response(&url).await?;
        let result = JsonUtils::get_path(&response, &["content", "fundFlowDay", "result"]).unwrap_or(&Value::Null);

        let asset = Asset::get_id_by_code(&args.code).await?;
        if asset.is_none() {
            return Err(Error::Error(String::from("`asset` is not exists!")).to_string());
        }

        let asset = asset.unwrap_or_default();
        let asset_id = asset.id.unwrap_or_default();
        Self::insert_table(&result, &flow_type, &asset_id).await
    }

    pub async fn insert_table(result: &Value, flow_type: &str, asset_id: &str) -> Result<HttpResponse, String> {
        if JsonUtils::is_empty(&result) {
            return Err(Error::Error(String::from("insert stock fund flow error: `result` is empty!")).to_string());
        }

        let close_px = JsonUtils::get_array_by_key(result, "closePx"); // 收盘价
        let main = JsonUtils::get_array_by_key(result, "main"); // 主力
        let retail = JsonUtils::get_array_by_key(result, "retail"); // 散户

        // 组装收盘价
        let mut close_px_map = HashMap::new();
        for item in close_px {
            let date = JsonUtils::get_string(&item, "date");
            if date.is_empty() {
                continue;
            }

            let close_px = JsonUtils::get_string(&item, "closePx");
            let close_px = Decimal::from_str(&close_px).unwrap_or_default();
            close_px_map.insert(date.to_string(), close_px);
        }

        let mut args_list = Vec::new();

        // 主力
        Self::generate_args_list(flow_type, asset_id, "main", main, &mut args_list, &close_px_map);

        // 散户
        Self::generate_args_list(flow_type, asset_id, "retail", retail, &mut args_list, &close_px_map);

        let _ = Self::batch_add(args_list).await;

        // 查询数据
        Self::query_stock_flow(asset_id, flow_type).await
    }

    fn generate_args_list(flow_type: &str, asset_id: &str, fund_type: &str, list: Vec<Value>, args_list: &mut Vec<StockFundFlowArgs>, close_px_map: &HashMap<String, Decimal>) {
        for item in list {
            let date = JsonUtils::get_string(&item, "date");
            if date.is_empty() {
                continue;
            }

            let net_turnover = JsonUtils::get_string(&item, "netTurnover");
            let turnover_in = JsonUtils::get_string(&item, "turnoverIn");
            let turnover_out = JsonUtils::get_string(&item, "turnoverOut");
            let args = StockFundFlowArgs {
                id: None,
                asset_id: asset_id.to_string(),
                flow_type: flow_type.to_string(),
                fund_type: fund_type.to_string(),
                close_px: close_px_map.get(&date).cloned().unwrap_or_default(),
                date: date.to_string(),
                net_turnover: Decimal::from_str(&net_turnover).unwrap_or_default(),
                turnover_in: Decimal::from_str(&turnover_in).unwrap_or_default(),
                turnover_out: Decimal::from_str(&turnover_out).unwrap_or_default(),
                create_time: None,
                update_time: None,
            };

            args_list.push(args);
        }
    }

    pub async fn query_stock_flow(asset_id: &str, flow_type: &str) -> Result<HttpResponse, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("query stock fund flow error: `asset_id` is empty!")).to_string());
        }

        if flow_type.is_empty() {
            return Err(Error::Error(String::from("query stock fund flow error: `flow_type` is empty!")).to_string());
        }

        let query = sqlx::query_as::<_, StockFundFlowArgs>(
            r#"
                    SELECT
                        id,
                        asset_id,
                        flow_type,
                        fund_type,
                        close_px,
                        `date`,
                        net_turnover,
                        turnover_in,
                        turnover_out,
                        create_time,
                        update_time
                    FROM stock_fund_flow
                    WHERE asset_id = ?
                      AND flow_type = ?
                      AND `date` >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
                    ORDER BY `date` ASC
              "#,
        )
        .bind(asset_id)
        .bind(flow_type);

        let list = DBHelper::execute(query).await?;

        let mut main = Vec::new();
        let mut retail = Vec::new();

        for item in list {
            match item.fund_type.as_str() {
                "main" => main.push(item),
                "retail" => retail.push(item),
                _ => {}
            }
        }

        // 组装
        let result = serde_json::json!({
            "main": main,
            "retail": retail,
        });

        Ok(get_success_response(Some(result)))
    }

    // 添加
    pub async fn batch_add(args_list: Vec<StockFundFlowArgs>) -> Result<bool, String> {
        if args_list.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            if args.asset_id.is_empty() {
                info!("{} fund asset allocation skip, `asset_id` is empty", LOGGER_PREFIX);
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO stock_fund_flow(id, asset_id, flow_type, fund_type, close_px, date, net_turnover, turnover_in, turnover_out, create_time, update_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                close_px = VALUES(close_px),
                net_turnover = VALUES(net_turnover),
                turnover_in = VALUES(turnover_in),
                turnover_out = VALUES(turnover_out),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.flow_type)
            .bind(args.fund_type)
            .bind(args.close_px)
            .bind(args.date)
            .bind(args.net_turnover)
            .bind(args.turnover_in)
            .bind(args.turnover_out)
            .bind(time.clone())
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "fund_flow").await
    }
}
