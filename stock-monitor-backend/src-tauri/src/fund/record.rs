/*!
  资产同步记录表(asset_sync_record)
*/

use crate::database::helper::DBHelper;
use chrono::NaiveDateTime;
use log::error;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AssetSyncRecordArgs {
    pub id: String,               // ID
    pub asset_id: String,         // 资产ID
    pub sync_type: String,        // 同步类型
    pub sync_time: NaiveDateTime, // 最后同步时间
}

pub enum AssetSyncType {
    Basic,    // 基础信息
    Fund,     // 全量基金数据
    NavCurve, // 净值曲线
    Holding,  // 持仓
    Manager,  // 基金经理
    Rate,     // 费率
}

pub struct AssetSyncRecord {}
impl AssetSyncType {
    pub fn as_str(&self) -> &str {
        match self {
            AssetSyncType::Basic => "basic",
            AssetSyncType::Fund => "fund",
            AssetSyncType::NavCurve => "nav_curve",
            AssetSyncType::Holding => "holding",
            AssetSyncType::Manager => "manager",
            AssetSyncType::Rate => "rate",
        }
    }
}

impl AssetSyncRecord {
    pub async fn get(asset_id: &str, sync_type: &str) -> Result<Option<AssetSyncRecordArgs>, String> {
        if asset_id.is_empty() || sync_type.is_empty() {
            error!("`asset_id` or `sync_type` is empty!");
            return Ok(None);
        }

        let sql = String::from(
            r#"
                    SELECT
                        *
                    FROM
                        asset_sync_record
                    WHERE
                        asset_id = ?
                    AND sync_type = ?
                    ORDER BY create_time DESC
                    LIMIT 1
               "#,
        );

        let query = sqlx::query_as::<_, AssetSyncRecordArgs>(&sql).bind(asset_id).bind(sync_type);
        DBHelper::execute_query_one(query).await
    }

    pub async fn update(asset_id: &str, sync_type: &str) -> Result<bool, String> {
        let query = sqlx::query::<MySql>(
            r#"
                INSERT INTO asset_sync_record(id, asset_id, sync_type, sync_time, create_time)
                VALUES (?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                sync_time = NOW(),
                update_time = NOW()
            "#,
        )
        .bind(Uuid::new_v4().to_string())
        .bind(asset_id)
        .bind(sync_type);

        DBHelper::execute_crud(query).await
    }
}
