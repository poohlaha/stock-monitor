/*!
  行业基础信息表(stock_industry)
  行业关系表(stock_industry_relation)
  资产行业关联表(asset_industry)
*/

use std::collections::HashMap;
use crate::asset::asset::{Asset, AssetArgs};
use crate::asset::tag::AssetTagArgs;
use crate::database::helper::DBHelper;
use crate::error::Error;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockIndustryArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "code")]
    pub code: String, // 行业代码

    #[serde(rename = "name")]
    pub name: String, // 行业名称

    #[serde(rename = "source")]
    pub source: String, // 行业体系来源

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AssetIndustryArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "industryId")]
    pub industry_id: String, // 行业ID

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AssetIndustryResultArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "industryId")]
    pub industry_id: String, // 行业ID

    #[serde(rename = "industryCode")]
    pub industry_code: String,

    #[serde(rename = "industryName")]
    pub industry_name: String,

    #[serde(rename = "industrySource")]
    pub industry_source: String,

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct AssetInfoArgs {
    pub asset: Option<AssetArgs>,
    pub tags: Vec<AssetTagArgs>,
    pub industry: Vec<AssetIndustryResultArgs>,
}

pub struct StockIndustry;

impl StockIndustry {
    pub async fn batch_add(asset_id: &str, source: &str, industry_list: Vec<StockIndustryArgs>, asset_industry_list: Vec<AssetIndustryArgs>) -> Result<bool, String> {
        if asset_id.is_empty() || source.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        let mut industry_id_map = HashMap::new();

        // 1. 行业基础信息
        for industry in industry_list {
            let stock_industry = Self::get_by_code_source(&industry.code, &industry.source).await?;
            let old_id = industry.id.clone().unwrap_or_default();
            let id = match stock_industry {
                None => industry.id.unwrap_or_else(|| Uuid::new_v4().to_string()),
                Some(stock_industry) => stock_industry.id.unwrap_or_else(|| Uuid::new_v4().to_string()),
            };

            let create_time = industry.create_time.unwrap_or_else(|| time.clone());
            let update_time = industry.update_time.unwrap_or_else(|| time.clone());

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO stock_industry (
                    id,
                    code,
                    name,
                    source,
                    create_time,
                    update_time
                )
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    `name` = VALUES(`name`),
                    `source` = VALUES(`source`),
                    update_time = VALUES(update_time)
            "#,
            )
            .bind(id.clone())
            .bind(industry.code.clone())
            .bind(industry.name)
            .bind(industry.source)
            .bind(create_time)
            .bind(update_time);

            industry_id_map.insert(old_id, id);
            query_list.push(query);
        }

        // 2. 删除当前资产的行业关系
        let delete_asset_industry_query = sqlx::query::<MySql>(
            r#"
            DELETE FROM asset_industry
            WHERE asset_id = ?
        "#,
        )
        .bind(asset_id);

        query_list.push(delete_asset_industry_query);

        // 3. 插入资产行业关系
        let mut industry_query_list = Vec::new();
        for asset_industry in asset_industry_list {
            let id = asset_industry.id.unwrap_or_else(|| Uuid::new_v4().to_string());
            let create_time = asset_industry.create_time.unwrap_or_else(|| time.clone());
            let update_time = asset_industry.update_time.unwrap_or_else(|| time.clone());

            let industry_id = match industry_id_map.get(&asset_industry.industry_id) {
                None => Uuid::new_v4().to_string(),
                Some(industry_id) => industry_id.clone(),
            };

            if industry_id.is_empty() {
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO asset_industry (
                    id,
                    asset_id,
                    industry_id,
                    create_time,
                    update_time
                )
                VALUES (?, ?, ?, ?, ?)
            "#,
            )
            .bind(id)
            .bind(asset_id)
            .bind(industry_id)
            .bind(create_time)
            .bind(update_time);

            industry_query_list.push(query);
        }

        if industry_query_list.is_empty() {
            return Ok(false);
        }

        query_list.extend(industry_query_list);
        DBHelper::batch(query_list, "info").await
    }

    // 通过 code、source 查找 id
    pub async fn get_by_code_source(code: &str, source: &str) -> Result<Option<StockIndustryArgs>, String> {
        if code.is_empty() || source.is_empty() {
            return Err(Error::Error(String::from("`code` or `source` is empty!")).to_string());
        }

        let sql = r#"
                SELECT
                    *
                FROM
                    stock_industry
                WHERE
                    code = ?
                AND
                    source = ?
                LIMIT 1
            "#;

        let query = sqlx::query_as::<_, StockIndustryArgs>(sql).bind(code).bind(source);
        DBHelper::execute_query_one(query).await
    }

    // 通过 ID 查找
    pub async fn get_asset_industry_by_asset_id(asset_id: &str) -> Result<Vec<AssetIndustryResultArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
                SELECT
                    ai.id,
                    ai.asset_id,
                    ai.industry_id,
                    si.code AS industry_code,
                    si.name AS industry_name,
                    si.source AS industry_source,
                    ai.create_time,
                    ai.update_time
                FROM
                    asset_industry ai
                INNER JOIN
                    stock_industry si
                        ON si.id = ai.industry_id
                WHERE
                    ai.asset_id = ?
            "#;

        let query = sqlx::query_as::<_, AssetIndustryResultArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }

    // 查询详情
    pub async fn get_detail_by_id(asset_id: &str) -> Result<Option<AssetInfoArgs>, String> {
        let asset_detail_args = Asset::get_detail_by_id(asset_id).await?;

        let mut info_args = AssetInfoArgs::default();
        if let Some(asset_detail_args) = asset_detail_args {
            info_args.asset = asset_detail_args.asset;
            info_args.tags = asset_detail_args.tags;
        }

        let industry = Self::get_asset_industry_by_asset_id(asset_id).await?;
        info_args.industry = industry;
        Ok(Some(info_args))
    }
}
