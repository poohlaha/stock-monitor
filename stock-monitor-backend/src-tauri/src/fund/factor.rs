/*!
  基金量化因子指标表，记录波动率、最大回撤、夏普比率等风险收益指标(fund_factor)
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

#[derive(Debug, Clone)]
pub enum FactorType {
    Return,
    Volatility,
    MaxDrawdown,
    Sharpe,
}

impl FactorType {
    pub fn as_str(&self) -> &'static str {
        match self {
            FactorType::Return => "return",
            FactorType::Volatility => "volatility",
            FactorType::MaxDrawdown => "max_drawdown",
            FactorType::Sharpe => "sharpe",
        }
    }
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundFactorArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "period")]
    pub period: String, // 周期

    #[serde(rename = "factorType")]
    pub factor_type: String, // 因子类型

    #[serde(rename = "factor_name")]
    pub factor_name: String, // 展示名称

    #[serde(rename = "factorValue")]
    pub factor_value: Decimal, // 因子值

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundFactor {}

impl FundFactor {
    // 批量添加
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundFactorArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();

        // 删除
        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                    fund_factor
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
                INSERT INTO fund_factor(id, asset_id, period, factor_type, factor_name, factor_value, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.period)
            .bind(args.factor_type)
            .bind(args.factor_name)
            .bind(args.factor_value)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "factor").await
    }

    pub fn parse_period(text: &str) -> Option<Period> {
        if text.starts_with("近1周") {
            Some(Period::Week1)
        } else if text.starts_with("近1月") {
            Some(Period::Month1)
        } else if text.starts_with("近3月") {
            Some(Period::Month3)
        } else if text.starts_with("近6月") {
            Some(Period::Month6)
        } else if text.starts_with("近1年") {
            Some(Period::Year1)
        } else if text.starts_with("近2年") {
            Some(Period::Year2)
        } else if text.starts_with("近3年") {
            Some(Period::Year3)
        } else if text.starts_with("近5年") {
            Some(Period::Year5)
        } else if text.contains("今年以来") {
            Some(Period::Ytd)
        } else if text.contains("成立以来") {
            Some(Period::Since)
        } else {
            None
        }
    }

    pub fn get_factor_type(name: &str) -> Option<FactorType> {
        if name.contains("收益率") {
            Some(FactorType::Return)
        } else if name.contains("波动率") {
            Some(FactorType::Volatility)
        } else if name.contains("最大回撤") {
            Some(FactorType::MaxDrawdown)
        } else if name.contains("夏普比率") {
            Some(FactorType::Sharpe)
        } else {
            None
        }
    }

    // 根据资产ID查询基金量化因子
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundFactorArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = String::from(
            r#"
                SELECT
                    *
                FROM
                    fund_factor
                WHERE
                    asset_id = ?
                ORDER BY
                    period ASC,
                    factor_type ASC
            "#,
        );

        let query = sqlx::query_as::<_, FundFactorArgs>(&sql).bind(asset_id);
        DBHelper::execute(query).await
    }
}
