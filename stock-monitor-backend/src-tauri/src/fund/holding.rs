/*!
  基金持仓明细表，记录基金股票、债券等具体投资标的信息及占比(fund_holding)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use crate::LOGGER_PREFIX;
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundHoldingArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "holdingType")]
    pub holding_type: String, // 资产类型 stock/bond

    #[serde(rename = "targetCode")]
    pub target_code: String, // 股票债券代码

    #[serde(rename = "targetName")]
    pub target_name: String, // 名称

    #[serde(rename = "market")]
    pub market: String, // 市场

    #[serde(rename = "proportion")]
    pub proportion: Decimal, // 持仓比例

    #[serde(rename = "priceChange")]
    pub price_change: Option<Decimal>, // 涨跌幅

    #[serde(rename = "reportDate")]
    pub report_date: String, // 报告日期

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundHolding {}

impl FundHolding {
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundHoldingArgs>, holding_type: &str) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();

        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                    fund_holding
                WHERE asset_id = ?
                AND holding_type = ?
            "#,
        )
        .bind(asset_id)
        .bind(holding_type);

        query_list.push(delete_query);

        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_holding(id, asset_id, holding_type, target_code, target_name, market, proportion, price_change, report_date, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.holding_type)
            .bind(args.target_code)
            .bind(args.target_name)
            .bind(args.market)
            .bind(args.proportion)
            .bind(args.price_change)
            .bind(args.report_date)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "holding").await
    }

    // 根据资产ID查询基金持仓明细
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundHoldingArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_holding
            WHERE
                asset_id = ?
            ORDER BY
                report_date DESC,
                proportion DESC
        "#;

        let query = sqlx::query_as::<_, FundHoldingArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }
}
