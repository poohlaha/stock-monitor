/*!
  资产标签信息表，用于描述资产分类和主题属性(asset_tag)
*/

use crate::asset::asset::AssetDetailArgs;
use crate::database::helper::DBHelper;
use crate::error::Error;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AssetTagArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // 资产ID

    #[serde(rename = "name")]
    pub name: String, // 标签名称

    #[serde(rename = "tagType")]
    pub tag_type: String, // 标签类型

    #[serde(rename = "img")]
    pub img: String, // 标签图标

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct AssetTag {}

impl AssetTag {
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<AssetTagArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                t.*
            FROM
                asset_tag t
            INNER JOIN
                asset_tag_relation r
            ON
                t.id = r.tag_id
            WHERE
                r.asset_id = ?
            ORDER BY
                t.create_time ASC
        "#;

        let query = sqlx::query_as::<_, AssetTagArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }

    pub async fn get_by_name(name: &str) -> Result<Option<AssetTagArgs>, String> {
        if name.is_empty() {
            return Ok(None);
        }

        let sql = r#"
            SELECT
                *
            FROM
                asset_tag
            WHERE
                name = ?
        "#;

        let query = sqlx::query_as::<_, AssetTagArgs>(sql).bind(name);
        DBHelper::execute_query_one(query).await
    }
}
