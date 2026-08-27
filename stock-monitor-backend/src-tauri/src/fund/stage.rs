/*!
  基金阶段表现fund_stage_performance), 偏同类比较和排名分析
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
pub struct FundStagePerformanceArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "period")]
    pub period: String, // 周期

    #[serde(rename = "priceChange")]
    pub price_change: Decimal, // 涨跌幅

    #[serde(rename = "averageChange")]
    pub average_change: Decimal,

    #[serde(rename = "rankNum")]
    pub rank_num: Option<i32>,

    #[serde(rename = "rankTotal")]
    pub rank_total: Option<i32>,

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundStagePerformance {}

impl FundStagePerformance {
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundStagePerformanceArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                     fund_stage_performance
                WHERE
                    asset_id = ?
            "#,
        )
        .bind(asset_id);

        query_list.push(delete_query);

        for args in args_list {
            if args.asset_id.is_empty() {
                info!("{} fund stage performance skip, `asset_id` is empty", LOGGER_PREFIX);
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_stage_performance(id, asset_id, period, price_change, average_change, rank_num, rank_total, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.period)
            .bind(args.price_change)
            .bind(args.average_change)
            .bind(args.rank_num)
            .bind(args.rank_total)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "stage").await
    }

    pub fn get_stage_period(name: &str) -> String {
        match name {
            "近1周" => "week".to_string(),
            "近1月" => "month".to_string(),
            "近3月" => "3month".to_string(),
            "近6月" => "6month".to_string(),
            "近1年" => "1year".to_string(),
            "近2年" => "2year".to_string(),
            "近3年" => "3year".to_string(),
            "近5年" => "5year".to_string(),
            "今年以来" => "ytd".to_string(),
            _ => String::new(),
        }
    }

    // 根据资产ID查询基金阶段业绩表现
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundStagePerformanceArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = String::from(
            r#"
                SELECT
                    *
                FROM
                    fund_stage_performance
                WHERE
                    asset_id = ?
                ORDER BY
                    period ASC
            "#,
        );

        let query = sqlx::query_as::<_, FundStagePerformanceArgs>(&sql).bind(asset_id);
        DBHelper::execute(query).await
    }
}
