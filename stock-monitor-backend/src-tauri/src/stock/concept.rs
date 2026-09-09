/*!
  股票概念表(stock_concept)
  股票概念关联表(stock_concept_relation)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockConceptArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "code")]
    pub code: String, // 概念代码

    #[serde(rename = "name")]
    pub name: String, // 概念名称

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockConceptRelationArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "conceptId")]
    pub concept_id: String, // 概念ID

    #[serde(rename = "ratio")]
    pub change_rate: Decimal, // 概念涨跌幅

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockConceptWithRelationArgs {
    #[serde(flatten)]
    pub concept: StockConceptArgs,

    #[serde(rename = "relation")]
    pub relation: Vec<StockConceptRelationArgs>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
struct StockConceptRelationRow {
    pub id: String,
    pub code: String,
    pub name: String,
    #[serde(rename = "createTime")]
    pub create_time: Option<String>,
    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,

    #[serde(rename = "relationId")]
    pub relation_id: String,
    #[serde(rename = "relationAssetId")]
    pub relation_asset_id: String,
    #[serde(rename = "relationConceptId")]
    pub relation_concept_id: String,
    #[serde(rename = "changeRate")]
    pub change_rate: Decimal,
    #[serde(rename = "relationCreateTime")]
    pub relation_create_time: Option<String>,
    #[serde(rename = "relationUpdateTime")]
    pub relation_update_time: Option<String>,
}

pub struct StockConcept;

impl StockConcept {
    pub async fn batch_add(asset_id: &str, args_list: Vec<StockConceptArgs>, relation_list: Vec<StockConceptRelationArgs>) -> Result<bool, String> {
        if asset_id.is_empty() || args_list.is_empty() || relation_list.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        // code -> concept_id
        let mut concept_id_map = HashMap::new();

        // 用于关联表获取id
        let mut concept_relation_id_map = HashMap::new();
        let mut code_list = Vec::new();

        // 查询所有 code 对应数据是否已存在
        for args in &args_list {
            if !args.code.is_empty() {
                code_list.push(args.code.clone());
            }
        }

        let concept_args = Self::get_by_codes(&code_list).await?;
        for args in concept_args {
            concept_id_map.insert(args.code.clone(), args.id.unwrap_or(String::new()).clone());
        }

        // 1. 股票概念
        for args in args_list {
            if args.code.is_empty() {
                continue;
            }

            // 已存在，直接使用已有 ID
            let old_id = args.id.clone().unwrap_or_default();
            let concept_id = concept_id_map.get(&args.code);
            if concept_id_map.contains_key(&args.code) {
                if let Some(concept_id) = concept_id {
                    concept_relation_id_map.insert(old_id, concept_id.clone());
                }
                continue;
            }

            // 不存在，新增概念
            let id = match concept_id_map.get(&args.code) {
                None => args.id.unwrap_or_else(|| Uuid::new_v4().to_string()),
                Some(id) => id.clone(),
            };

            query_list.push(
                sqlx::query::<MySql>(
                    r#"
                INSERT INTO stock_concept (
                    id,
                    code,
                    name,
                    create_time,
                    update_time
                )
                VALUES (?, ?, ?, ?, ?)
            "#,
                )
                .bind(id.clone())
                .bind(args.code.clone())
                .bind(args.name.clone())
                .bind(time.clone())
                .bind(time.clone()),
            );

            // 放进去，后面 relation 直接拿
            concept_relation_id_map.insert(old_id, id);
        }

        // 2. 删除股票概念关联
        let delete_relation_query = sqlx::query::<MySql>(
            r#"
            DELETE FROM stock_concept_relation
            WHERE asset_id = ?
        "#,
        )
        .bind(asset_id);

        query_list.push(delete_relation_query);

        // 3. 股票概念关联表
        let mut relation_query_list = Vec::new();
        for relation in relation_list {
            let id = relation.id.unwrap_or_else(|| Uuid::new_v4().to_string());
            let create_time = relation.create_time.unwrap_or_else(|| time.clone());
            let update_time = relation.update_time.unwrap_or_else(|| time.clone());

            let concept_id = concept_relation_id_map.get(&relation.concept_id);
            if let Some(concept_id) = concept_id {
                let query = sqlx::query::<MySql>(
                    r#"
                  INSERT INTO stock_concept_relation (
                      id,
                      asset_id,
                      concept_id,
                      change_rate,
                      create_time,
                      update_time
                  )
                  VALUES (?, ?, ?, ?, ?, ?)
              "#,
                )
                .bind(id)
                .bind(asset_id)
                .bind(concept_id)
                .bind(relation.change_rate)
                .bind(create_time)
                .bind(update_time);

                relation_query_list.push(query);
            }
        }

        if relation_query_list.is_empty() {
            return Ok(false);
        }

        query_list.extend(relation_query_list);
        DBHelper::batch(query_list, "concept").await
    }

    // 通过 code 查找
    pub async fn get_by_codes(code: &Vec<String>) -> Result<Vec<StockConceptArgs>, String> {
        if code.is_empty() {
            return Err(Error::Error(String::from("`code` is empty!")).to_string());
        }

        let placeholders = std::iter::repeat("?").take(code.len()).collect::<Vec<_>>().join(", ");

        let sql = format!(
            r#"
            SELECT
                *
            FROM
                stock_concept
            WHERE
                code IN ({})
            "#,
            placeholders
        );

        let mut query = sqlx::query_as::<_, StockConceptArgs>(&sql);

        for item in code {
            query = query.bind(item);
        }

        DBHelper::execute(query).await
    }

    // 查询详情
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<StockConceptWithRelationArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                c.id,
                c.code,
                c.name,
                c.create_time,
                c.update_time,

                r.id AS relation_id,
                r.asset_id AS relation_asset_id,
                r.concept_id AS relation_concept_id,
                r.change_rate,
                r.create_time AS relation_create_time,
                r.update_time AS relation_update_time
            FROM
                stock_concept c
            INNER JOIN
                stock_concept_relation r
                ON r.concept_id = c.id
            WHERE
                r.asset_id = ?
            ORDER BY
                c.code
        "#;

        let query = sqlx::query_as::<_, StockConceptRelationRow>(sql).bind(asset_id);
        let rows = DBHelper::execute(query).await?;
        // concept_id -> StockConceptWithRelationArgs
        let mut map: HashMap<String, StockConceptWithRelationArgs> = HashMap::new();

        for row in rows {
            let concept_id = row.id.clone();

            let relation = StockConceptRelationArgs {
                id: Some(row.relation_id),
                asset_id: row.relation_asset_id,
                concept_id: row.relation_concept_id,
                change_rate: row.change_rate,
                create_time: row.relation_create_time,
                update_time: row.relation_update_time,
            };

            map.entry(concept_id.clone())
                .or_insert_with(|| StockConceptWithRelationArgs {
                    concept: StockConceptArgs {
                        id: Some(row.id),
                        code: row.code,
                        name: row.name,
                        create_time: row.create_time,
                        update_time: row.update_time,
                    },
                    relation: Vec::new(),
                })
                .relation
                .push(relation);
        }

        Ok(map.into_values().collect())
    }
}
