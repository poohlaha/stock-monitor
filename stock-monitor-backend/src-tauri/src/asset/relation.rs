/*!
  资产标签关联表，维护资产与标签之间的多对多关系(asset_tag_relation)
*/

use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct AssetTagRelationArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // 资产ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 标签名称

    #[serde(rename = "tagId")]
    pub tag_id: String, // 标签类型

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct AssetTagRelation {}

impl AssetTagRelation {}
