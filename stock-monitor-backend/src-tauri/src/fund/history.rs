/*!
  基金规模历史表，记录基金资产规模及净资产规模变化情况(fund_scale_history)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use regex::Regex;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundScaleHistoryArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "name")]
    pub name: String, // 显示文字

    #[serde(rename = "scale")]
    pub scale: Decimal, // 基金规模(亿元)

    #[serde(rename = "netAsset")]
    pub net_asset: Decimal, // 净资产规模(亿元)

    #[serde(rename = "reportDate")]
    pub report_date: String, // 报告日期

    #[serde(rename = "periodSort")]
    pub period_sort: i32, // 季度排序值

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundScaleHistory {}

impl FundScaleHistory {
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundScaleHistoryArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();

        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                    fund_scale_history
                WHERE
                    asset_id = ?
            "#,
        )
        .bind(asset_id);

        query_list.push(delete_query);

        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_scale_history(id, asset_id, name, report_date, scale, net_asset, period_sort, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.name)
            .bind(args.report_date)
            .bind(args.scale)
            .bind(args.net_asset)
            .bind(args.period_sort)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "history").await
    }

    // 根据资产ID查询基金规模历史
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundScaleHistoryArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_scale_history
            WHERE
                asset_id = ?
            ORDER BY
                period_sort ASC
        "#;

        let query = sqlx::query_as::<_, FundScaleHistoryArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }

    pub fn period_to_sort(name: &str) -> i32 {
        let re = Regex::new(r"(\d{4})年Q([1-4])").unwrap();

        if let Some(cap) = re.captures(name) {
            let year: i32 = cap[1].parse().unwrap_or(0);
            let quarter: i32 = cap[2].parse().unwrap_or(0);

            return year * 100 + quarter;
        }

        0
    }
}
