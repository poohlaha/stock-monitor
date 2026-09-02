/*!
  基金收益走势曲线表，用于展示基金与同类基金及指数收益走势比较(fund_performance_curve)
  基金历史净值曲线表，记录基金每日单位净值及累计净值变化(fund_performance_curve)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use crate::fund::info::FundInfo;
use crate::LOGGER_PREFIX;
use chrono::{Datelike, Local, NaiveDate};
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundPerformanceCurveArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "seriesType")]
    pub series_type: String, // 曲线类型: fund(本基金), average(同类平均), index(指数)

    #[serde(rename = "reportDate")]
    pub report_date: NaiveDate, // 日期

    #[serde(rename = "value")]
    pub value: Decimal, // 累计收益率(%)

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundNavCurveArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "unitNav")]
    pub unit_nav: Decimal, // 单位净值

    #[serde(rename = "dayChange")]
    pub day_change: Decimal, // 日涨幅(%)

    #[serde(rename = "accumulatedNav")]
    pub accumulated_nav: Decimal, // 累计净值

    #[serde(rename = "reportDate")]
    pub report_date: NaiveDate, // 日期

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct FundPerformanceCurveVO {
    #[serde(rename = "reportDate")]
    pub report_date: NaiveDate,
    pub fund: Option<Decimal>,
    pub average: Option<Decimal>,
    pub index: Option<Decimal>,
}

pub enum NavPeriod {
    Month1,
    Month3,
    Month6,
    Year1,
    Year3,
    Year5,
    Since,
}

impl NavPeriod {
    pub fn months(&self) -> Option<i32> {
        match self {
            NavPeriod::Month1 => Some(1),
            NavPeriod::Month3 => Some(3),
            NavPeriod::Month6 => Some(6),
            NavPeriod::Year1 => Some(12),
            NavPeriod::Year3 => Some(36),
            NavPeriod::Year5 => Some(60),
            NavPeriod::Since => None,
        }
    }

    pub fn from_month(month: &str) -> Result<Self, String> {
        match month {
            "1" => Ok(Self::Month1),
            "3" => Ok(Self::Month3),
            "6" => Ok(Self::Month6),
            "12" => Ok(Self::Year1),
            "36" => Ok(Self::Year3),
            "60" => Ok(Self::Year5),
            _ => Ok(Self::Since),
        }
    }
}

pub struct FundCurve {}

impl FundCurve {
    // 批量添加业绩走势
    pub async fn batch_performance_add(asset_id: &str, args_list: Vec<FundPerformanceCurveArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                      fund_performance_curve
                WHERE
                    asset_id = ?
            "#,
        )
        .bind(asset_id);
        query_list.push(delete_query);

        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_performance_curve(id, asset_id, series_type, report_date, value, create_time)
                VALUES (?, ?, ?, ?, ?, ?)

                ON DUPLICATE KEY UPDATE
                value = VALUES(value),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.series_type)
            .bind(args.report_date)
            .bind(args.value)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "curve").await
    }

    // 批量添加净值曲线
    pub async fn batch_nav_add(asset_id: &str, args_list: Vec<FundNavCurveArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                      fund_nav_curve
                WHERE
                    asset_id = ?
            "#,
        )
        .bind(asset_id);
        query_list.push(delete_query);

        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_nav_curve(id, asset_id, unit_nav, day_change, accumulated_nav, report_date, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.unit_nav)
            .bind(args.day_change)
            .bind(args.accumulated_nav)
            .bind(args.report_date)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "curve").await
    }

    // 查询业绩走势
    pub async fn query_performance(asset_id: &str, period: &NavPeriod) -> Result<Vec<FundPerformanceCurveVO>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let query = match period.months() {
            Some(month) => {
                let sql = r#"
                    SELECT
                        *
                    FROM
                        fund_performance_curve
                    WHERE
                        asset_id = ?
                    AND report_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                    ORDER BY report_date ASC
               "#;

                sqlx::query_as::<_, FundPerformanceCurveArgs>(sql).bind(asset_id).bind(month)
            }
            None => {
                let sql = r#"
                    SELECT
                        *
                    FROM
                        fund_performance_curve
                    WHERE
                        asset_id = ?
                    ORDER BY report_date ASC
               "#;

                sqlx::query_as::<_, FundPerformanceCurveArgs>(sql).bind(asset_id)
            }
        };

        let list = DBHelper::execute(query).await?;

        let mut map: HashMap<NaiveDate, FundPerformanceCurveVO> = HashMap::new();
        for item in list {
            let entry = map.entry(item.report_date).or_insert(FundPerformanceCurveVO {
                report_date: item.report_date,
                fund: None,
                average: None,
                index: None,
            });

            match item.series_type.as_str() {
                "fund" => {
                    entry.fund = Some(item.value);
                }
                "average" => {
                    entry.average = Some(item.value);
                }
                "index" => {
                    entry.index = Some(item.value);
                }
                _ => {}
            }
        }

        let mut result: Vec<_> = map.into_values().collect();
        result.sort_by(|a, b| a.report_date.cmp(&b.report_date));

        Ok(result)
    }

    // 查询净值曲线
    pub async fn query_nav(asset_id: &str, period: &NavPeriod) -> Result<Vec<FundNavCurveArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let query = match period.months() {
            Some(month) => {
                let sql = r#"
                    SELECT
                        *
                    FROM
                        fund_nav_curve
                    WHERE
                        asset_id = ?
                    AND report_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
                    ORDER BY
                        report_date ASC
               "#;

                sqlx::query_as::<_, FundNavCurveArgs>(sql).bind(asset_id).bind(month)
            }
            None => {
                let sql = r#"
                    SELECT
                        *
                    FROM
                        fund_nav_curve
                    WHERE
                        asset_id = ?
                    ORDER BY
                        report_date ASC
               "#;

                sqlx::query_as::<_, FundNavCurveArgs>(sql).bind(asset_id)
            }
        };

        DBHelper::execute(query).await
    }

    // 计算成立以来的月数
    pub async fn judge_month(asset_id: &str) -> Result<i32, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        // 根据 asset_id 查询 fund_info 表中的 establish_date, 并计算月数
        let found_info = FundInfo::get_by_asset_id(asset_id).await?;
        if let Some(info) = found_info {
            let establish_date = info.establish_date;
            if establish_date.is_empty() {
                return Ok(-1);
            }

            let establish_date = NaiveDate::parse_from_str(&establish_date, "%Y-%m-%d").map_err(|e| e.to_string())?;
            let today = Local::now().date_naive();
            let months = (today.year() - establish_date.year()) * 12 + today.month() as i32 - establish_date.month() as i32;

            info!("{} 基金成立月份: {}", LOGGER_PREFIX, months);

            return Ok(months);
        }

        Ok(-1)
    }

    pub async fn check_performance_exists(asset_id: &str) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                COUNT(1)
            FROM
                fund_performance_curve
            WHERE
                asset_id = ?
        "#;

        let query = sqlx::query_scalar::<_, i64>(sql).bind(asset_id);
        let count = DBHelper::fetch_scalar(query).await?;

        Ok(count > 0)
    }

    pub async fn check_nav_exists(asset_id: &str) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                COUNT(1)
            FROM
                fund_nav_curve
            WHERE
                asset_id = ?
        "#;

        let query = sqlx::query_scalar::<_, i64>(sql).bind(asset_id);
        let count = DBHelper::fetch_scalar(query).await?;

        Ok(count > 0)
    }
}
