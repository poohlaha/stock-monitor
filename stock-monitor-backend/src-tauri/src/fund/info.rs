/*!
  基金扩展信息表，记录基金公司、托管人、投资目标、投资策略等基础信息(fund_info)
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
pub struct FundInfoArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "fundCode")]
    pub fund_code: String, // 基金代码

    #[serde(rename = "fundFullName")]
    pub fund_full_name: String, // 基金全称

    #[serde(rename = "fundType")]
    pub fund_type: String, // 基金类型(股票型/混合型/QDII等)

    #[serde(rename = "establishDate")]
    pub establish_date: String, // 成立日期

    #[serde(rename = "fundScale")]
    pub fund_scale: Option<Decimal>, // 最新规模(亿元)

    #[serde(rename = "fundScaleText")]
    pub fund_scale_text: Option<String>, // 最新规模(亿元)(文字)

    #[serde(rename = "fundCompany")]
    pub fund_company: String, // 基金公司

    #[serde(rename = "custodian")]
    pub custodian: String, // 基金托管人

    #[serde(rename = "benchmark")]
    pub benchmark: String, // 业绩基准

    #[serde(rename = "investmentTarget")]
    pub investment_target: String, // 投资目标

    #[serde(rename = "investmentStrategy")]
    pub investment_strategy: String, // 投资策略

    #[serde(rename = "latestNav")]
    pub latest_nav: Option<Decimal>, // 最新单位净值

    #[serde(rename = "latestNavDate")]
    pub latest_nav_date: Option<String>, // 最新净值日期

    #[serde(rename = "latestChange")]
    pub latest_change: Option<Decimal>, // 最新日涨幅(%)

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundInfo {}

impl FundInfo {
    // 批量添加
    pub async fn batch_add(args_list: Vec<FundInfoArgs>) -> Result<bool, String> {
        if args_list.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            if args.asset_id.is_empty() {
                info!("{} fund stage performance skip, `asset_id` is empty", LOGGER_PREFIX);
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_info(id, asset_id, fund_company, custodian, benchmark, establish_date, investment_target, investment_strategy, latest_nav, latest_nav_date, latest_change, fund_full_name, fund_type, fund_scale, fund_code, fund_scale_text, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                fund_company = VALUES(fund_company),
                custodian = VALUES(custodian),
                benchmark = VALUES(benchmark),
                establish_date = VALUES(establish_date),
                investment_target = VALUES(investment_target),
                investment_strategy = VALUES(investment_strategy),
                latest_nav = VALUES(latest_nav),
                latest_nav_date = VALUES(latest_nav_date),
                latest_change = VALUES(latest_change),
                fund_full_name = VALUES(fund_full_name),
                fund_type = VALUES(fund_type),
                fund_scale = VALUES(fund_scale),
                fund_scale_text = VALUES(fund_scale_text),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.fund_company)
            .bind(args.custodian)
            .bind(args.benchmark)
            .bind(args.establish_date)
            .bind(args.investment_target)
            .bind(args.investment_strategy)
            .bind(args.latest_nav)
            .bind(args.latest_nav_date)
            .bind(args.latest_change)
            .bind(args.fund_full_name)
            .bind(args.fund_type)
            .bind(args.fund_scale)
            .bind(args.fund_code)
            .bind(args.fund_scale_text)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "info").await
    }

    // 根据资产ID查询基金信息
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Option<FundInfoArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_info
            WHERE
                asset_id = ?
            LIMIT 1
        "#;

        let query = sqlx::query_as::<_, FundInfoArgs>(sql).bind(asset_id);
        DBHelper::execute_query_one(query).await
    }
}
