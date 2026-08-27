/*!
  基金行业持仓配置(fund_industry_allocation)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::MySql;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct FundIndustryAllocationArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "industryName")]
    pub industry_name: String, // 行业名称

    #[serde(rename = "proportion")]
    pub proportion: Decimal, // 占比

    #[serde(rename = "reportDate")]
    pub report_date: String, // 报告日期

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundIndustryAllocation {}

impl FundIndustryAllocation {
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundIndustryAllocationArgs>) -> Result<bool, String> {
        if args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();

        let delete_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                       fund_industry_allocation
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
                    INSERT INTO fund_industry_allocation(id, asset_id, industry_name, proportion, report_date, create_time)
                    VALUES (?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.industry_name)
            .bind(args.proportion)
            .bind(args.report_date)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "allocation").await
    }

    // 根据基金资产ID查询基金行业持仓配置信息
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundIndustryAllocationArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_industry_allocation
            WHERE
                asset_id = ?
        "#;

        let query = sqlx::query_as::<_, FundIndustryAllocationArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }
}
