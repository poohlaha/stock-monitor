/*!
  基金资产配置历史表，记录基金股票、债券、现金等大类资产配置比例(fund_asset_allocation)
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
pub struct FundAssetAllocationArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "assetType")]
    pub asset_type: String, // 资产类型 stock/bond/cash

    #[serde(rename = "assetTypeName")]
    pub asset_type_name: String, // 资产类型名称

    #[serde(rename = "proportion")]
    pub proportion: Decimal, // 占比

    #[serde(rename = "reportDate")]
    pub report_date: String, // 报告日期

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct FundAssetAllocation {}

impl FundAssetAllocation {
    // 批量添加
    pub async fn batch_add(args_list: Vec<FundAssetAllocationArgs>) -> Result<bool, String> {
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
                INSERT INTO fund_asset_allocation(id, asset_id, asset_type, asset_type_name, proportion, report_date, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                proportion = VALUES(proportion),
                report_date = VALUES(report_date),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.asset_type)
            .bind(args.asset_type_name)
            .bind(args.proportion)
            .bind(args.report_date)
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "allocation").await
    }

    pub fn get_allocation_type(name: &str) -> String {
        match name {
            "股票" => "stock".to_string(),
            "债券" => "bond".to_string(),
            "现金" => "cash".to_string(),
            _ => "".to_string(),
        }
    }

    // 根据基金资产ID查询基金资产配置历史信息
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundAssetAllocationArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_asset_allocation
            WHERE
                asset_id = ?
        "#;

        let query = sqlx::query_as::<_, FundAssetAllocationArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }
}
