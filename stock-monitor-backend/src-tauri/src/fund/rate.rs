/*!
  基金费率分类表，记录基金申购、赎回、管理等费用类型(fund_rate)
  基金费率明细表，记录不同条件下基金具体费率规则(fund_rate_detail)
*/

use crate::database::helper::DBHelper;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundRateArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "rateType")]
    pub rate_type: String, // 费率类型: 认购费率/申购费率/赎回费率/运作费率

    #[serde(rename = "rateDesc")]
    pub rate_desc: Option<String>, // 费率说明

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundRateDetailArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "rateId")]
    pub rate_id: String, // 基金费率ID

    #[serde(rename = "rateMeasure")]
    pub rate_measure: String, // 费率条件

    #[serde(rename = "unitRate")]
    pub unit_rate: Decimal, // 费率

    #[serde(rename = "description")]
    pub description: String, // 备注

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundRate {}

impl FundRate {
    pub async fn batch_add(args_list: Vec<FundRateArgs>, args_detail_list: Vec<FundRateDetailArgs>) -> Result<bool, String> {
        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        // 1. 基金费率表
        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_rate(id, asset_id, rate_type, rate_desc, create_time)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                rate_desc = VALUES(rate_desc),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(args.id)
            .bind(args.asset_id)
            .bind(args.rate_type)
            .bind(args.rate_desc)
            .bind(time.clone());

            query_list.push(query);
        }

        // 2. 费率明细表
        for detail_args in args_detail_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_rate_detail(id, rate_id, rate_measure, unit_rate, description, create_time)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                unit_rate = VALUES(unit_rate),
                description = VALUES(description),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(detail_args.id)
            .bind(detail_args.rate_id)
            .bind(detail_args.rate_measure)
            .bind(detail_args.unit_rate)
            .bind(detail_args.description)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "rate").await
    }
}
