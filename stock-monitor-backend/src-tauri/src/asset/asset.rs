/*!
 资产基础信息表，存储基金、股票、ETF等金融资产公共信息(asset)
*/

use crate::asset::tag::{AssetTag, AssetTagArgs};
use crate::database::helper::DBHelper;
use crate::error::Error;
use crate::fund::record::AssetSyncRecord;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AssetArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // 资产ID

    #[serde(rename = "code")]
    pub code: String, // 资产代码

    #[serde(rename = "name")]
    pub name: String, // 资产名称

    #[serde(rename = "assetType")]
    pub asset_type: String, // 资产类型(FUND/STOCK/ETF)

    #[serde(rename = "market")]
    pub market: String, // 所属市场

    #[serde(rename = "exchange")]
    pub exchange: String, // 交易所

    #[serde(rename = "avatar")]
    pub logo: Option<String>, // LOGO

    #[serde(rename = "disclosure")]
    pub disclosure: Option<String>, // 信息披露

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct AssetDetailArgs {
    pub asset: Option<AssetArgs>,
    pub tags: Vec<AssetTagArgs>,
}

pub struct Asset {}

impl Asset {
    // 插入资产
    pub async fn insert(asset_args: AssetArgs, asset_tag_args_list: Vec<AssetTagArgs>) -> Result<String, String> {
        // 通过 code 和 type 查询是否存在
        let asset = Self::get_by_code_type(&asset_args.code, &asset_args.asset_type).await?;

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);
        let create_time = asset_args.create_time.as_deref().unwrap_or(&time);

        // 1. 资产表
        let asset_id = match asset {
            None => {
                let id = Uuid::new_v4().to_string();
                let logo = asset_args.logo.as_deref().unwrap_or("");
                let disclosure = asset_args.disclosure.as_deref().unwrap_or("");
                let asset_type = asset_args.asset_type.to_uppercase();
                let asset_query = sqlx::query::<MySql>(
                    r#"
                            INSERT INTO asset(id, code, name, asset_type, market, exchange, logo, disclosure, create_time)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        "#,
                )
                .bind(id.clone())
                .bind(&asset_args.code)
                .bind(&asset_args.name)
                .bind(asset_type.clone())
                .bind(&asset_args.market)
                .bind(&asset_args.exchange)
                .bind(logo)
                .bind(disclosure)
                .bind(&create_time);

                query_list.push(asset_query);

                id
            }
            Some(asset) => {
                let id = asset.id.unwrap_or_default();
                let logo = asset_args.logo.as_deref().unwrap_or("");
                let disclosure = asset_args.disclosure.as_deref().unwrap_or("");

                let asset_query = sqlx::query::<MySql>(
                    r#"
                        UPDATE asset
                        SET
                            code = ?,
                            name = ?,
                            asset_type = ?,
                            market = ?,
                            exchange = ?,
                            logo = ?,
                            disclosure = ?,
                            update_time = ?
                        WHERE id = ?
                    "#,
                )
                .bind(&asset_args.code)
                .bind(&asset_args.name)
                .bind(&asset_args.asset_type)
                .bind(&asset_args.market)
                .bind(&asset_args.exchange)
                .bind(logo)
                .bind(disclosure)
                .bind(&create_time)
                .bind(id.clone());

                query_list.push(asset_query);

                id
            }
        };

        let delete_query = sqlx::query::<MySql>(
            r#"
                    DELETE FROM
                          asset_tag_relation
                    WHERE
                        asset_id = ?
                "#,
        )
        .bind(&asset_id);

        query_list.push(delete_query);

        // 2. 标签表
        for asset_tag_args in asset_tag_args_list {
            // 查询标签是否存在
            let tag_id = match AssetTag::get_by_name(&asset_tag_args.name).await? {
                None => {
                    let id = Uuid::new_v4().to_string();
                    let asset_tag_query = sqlx::query::<MySql>(
                        r#"
                                INSERT INTO asset_tag(id, name, tag_type, img, create_time)
                                VALUES (?, ?, ?, ?, ?)
                            "#,
                    )
                    .bind(id.clone())
                    .bind(asset_tag_args.name.clone())
                    .bind(asset_tag_args.tag_type.clone())
                    .bind(asset_tag_args.img.clone())
                    .bind(create_time.to_string().clone());

                    query_list.push(asset_tag_query);
                    id
                }
                Some(tag) => tag.id.unwrap_or_default(),
            };

            // 3. 资产标签表
            let asset_tag_relation_query = sqlx::query::<MySql>(
                r#"
                    INSERT INTO asset_tag_relation(id, asset_id, tag_id, create_time)
                    VALUES (?, ?, ?, ?)
                "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(&asset_id)
            .bind(tag_id.clone())
            .bind(create_time.to_string().clone());

            query_list.push(asset_tag_relation_query);
        }

        let _ = DBHelper::batch(query_list, "asset").await;

        Ok(asset_id)
    }

    // 通过 code 和 asset_type 查询资产信息
    pub async fn get_by_code_type(code: &str, asset_type: &str) -> Result<Option<AssetArgs>, String> {
        if code.is_empty() {
            return Err(Error::Error(String::from("`code` is empty!")).to_string());
        }

        if asset_type.is_empty() {
            return Err(Error::Error(String::from("`asset_type` is empty!")).to_string());
        }

        let sql = String::from(
            r#"
                    SELECT
                        *
                    FROM
                        asset
                    WHERE
                        code = ?
                    AND
                        asset_type = ?
                    LIMIT 1
               "#,
        );

        let query = sqlx::query_as::<_, AssetArgs>(&sql).bind(code).bind(asset_type.to_uppercase());
        DBHelper::execute_query_one(query).await
    }

    pub async fn get_id_by_code(code: &str) -> Result<Option<AssetArgs>, String> {
        if code.is_empty() {
            return Err(Error::Error(String::from("`code` is empty!")).to_string());
        }

        let sql = String::from(
            r#"
                    SELECT
                        *
                    FROM
                        asset
                    WHERE
                        code = ?
               "#,
        );

        let query = sqlx::query_as::<_, AssetArgs>(&sql).bind(code);
        DBHelper::execute_query_one(query).await
    }

    // 通过 ID 查找资产
    pub async fn get_by_id(asset_id: &str) -> Result<Option<AssetArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
                SELECT
                    *
                FROM
                    asset
                WHERE
                    id = ?
                LIMIT 1
            "#;

        let query = sqlx::query_as::<_, AssetArgs>(sql).bind(asset_id);
        DBHelper::execute_query_one(query).await
    }

    // 查询资产详情
    pub async fn get_detail_by_id(asset_id: &str) -> Result<Option<AssetDetailArgs>, String> {
        let asset = Self::get_by_id(asset_id).await?;

        if asset.is_none() {
            return Ok(None);
        }

        let tags = AssetTag::get_by_asset_id(asset_id).await?;
        Ok(Some(AssetDetailArgs { asset, tags }))
    }

    // 判断是否需要同步
    pub async fn check_need_sync(asset_id: &str, sync_type: &str) -> Result<bool, String> {
        let record = AssetSyncRecord::get(asset_id, sync_type).await?;
        match record {
            // 第一次同步
            None => Ok(true),
            Some(record) => {
                let today_start = chrono::Local::now().date_naive().and_hms_opt(0, 0, 0).unwrap();
                // 最后同步时间早于今天开始，需要同步
                Ok(record.sync_time < today_start)
            }
        }
    }
}
