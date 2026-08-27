/*!
  基金阶段收益表，记录基金不同周期的涨跌幅表现(fund_price_change),
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use crate::fund::Period;
use crate::LOGGER_PREFIX;
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundPriceChangeArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // 资产ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "name")]
    pub name: String, // 名称

    #[serde(rename = "priceChange")]
    pub price_change: Decimal, // 涨跌幅

    #[serde(rename = "period")]
    pub period: String, // 周期

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundPriceChange {}

impl FundPriceChange {
    // 删除后再添加
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundPriceChangeArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();

        // 删除数据
        let delete_query = sqlx::query::<MySql>(
            r#"
                   DELETE FROM
                        fund_price_change
                   WHERE asset_id = ?
            "#,
        )
        .bind(asset_id);

        query_list.push(delete_query);

        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_price_change(id, asset_id, name, price_change, period, create_time)
                VALUES (?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.name)
            .bind(args.price_change)
            .bind(args.period)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "price").await
    }

    pub fn get_change_period(name: &str) -> Option<Period> {
        match name {
            "近1周涨幅" => Some(Period::Week1),
            "近1月涨幅" => Some(Period::Month1),
            "近3月涨幅" => Some(Period::Month3),
            "近6月涨幅" => Some(Period::Month6),
            "近1年涨幅" => Some(Period::Year1),
            "近2年涨幅" => Some(Period::Year2),
            "近3年涨幅" => Some(Period::Year3),
            "近5年涨幅" => Some(Period::Year5),
            "今年以来涨幅" => Some(Period::Ytd),
            "成立至今涨幅" => Some(Period::Since),
            _ => None,
        }
    }

    // 根据资产ID查询阶段涨跌幅
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundPriceChangeArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = String::from(
            r#"
                SELECT
                    *
                FROM
                    fund_price_change
                WHERE
                    asset_id = ?
                ORDER BY
                    period ASC
            "#,
        );

        let query = sqlx::query_as::<_, FundPriceChangeArgs>(&sql).bind(asset_id);
        DBHelper::execute(query).await
    }
}
