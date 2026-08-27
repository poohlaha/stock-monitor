/*!
  用户自选资产表，记录用户关注的基金、股票等资产关系(my_watchlist)
*/

use crate::database::helper::DBHelper;
use crate::my::group::MyWatchGroup;
use crate::prepare::{get_error_response, HttpResponse};
use handlers::utils::Utils;
use log::info;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    #[serde(rename = "code")]
    pub code: String, // 基金名称

    #[serde(rename = "name")]
    pub name: String, // 基金代码

    #[serde(rename = "exchange")]
    pub exchange: String, // 排序

    #[serde(rename = "type")]
    pub _type: String, // 排序

    #[serde(rename = "market")]
    pub market: String, // 排序

    #[serde(rename = "groupIdList")]
    pub group_ids: Option<Vec<String>>, // 分组Id列表
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MyWatchList {
    pub id: String, // 主键

    #[serde(rename = "userId")]
    pub user_id: Option<String>, // 用户ID

    #[serde(rename = "code")]
    pub code: String, // 基金名称

    #[serde(rename = "name")]
    pub name: String, // 基金代码

    #[serde(rename = "aliasName")]
    pub alias_name: Option<String>, // 自定义名称

    #[serde(rename = "isPinned")]
    pub is_pinned: bool, // 是否置顶

    #[serde(rename = "sortOrder")]
    pub sort_order: i32, // 排序

    #[serde(rename = "exchange")]
    pub exchange: String, // 排序

    #[serde(rename = "type")]
    pub _type: String, // 类型

    #[serde(rename = "market")]
    pub market: String, // 市场

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,

    #[serde(rename = "groupName")]
    #[sqlx(default)]
    pub group_name: Option<String>,
}

impl MyWatchList {
    // 添加
    pub async fn add(args: &Args) -> Result<HttpResponse, String> {
        info!("save my params: {:#?}", args);
        if args.name.is_empty() || args.code.is_empty() {
            return Ok(get_error_response("添加的自选失败, `fundCode` 和 `fundName` 不能为空"));
        }

        let mut group_ids = args.group_ids.clone().unwrap_or(Vec::new());
        if group_ids.is_empty() {
            group_ids = MyWatchGroup::get_default_group_id().await?;
        }

        if group_ids.is_empty() {
            return Ok(get_error_response("添加的自选失败, 未找到默认的分组"));
        }

        let mut query_list = Vec::new();

        // 1. 添加自选
        let time = Utils::get_date(None);
        let watch_id = Uuid::new_v4().to_string();
        let watch_query = sqlx::query::<MySql>(
            r#"
                INSERT INTO my_watchlist
                (
                    id,
                    code,
                    name,
                    exchange,
                    type,
                    market,
                    create_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                "#,
        )
        .bind(&watch_id)
        .bind(&args.code)
        .bind(&args.name)
        .bind(&args.exchange)
        .bind(&args._type)
        .bind(&args.market)
        .bind(&time);

        query_list.push(watch_query);

        // 2. 添加分组关系
        for group_id in group_ids {
            let relation_query = sqlx::query::<MySql>(
                r#"
                        INSERT INTO my_watch_group_relation
                        (
                            id,
                            watchlist_id,
                            group_id
                        )
                        VALUES (?, ?, ?)
                    "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(&watch_id)
            .bind(group_id);

            query_list.push(relation_query);
        }

        DBHelper::batch_commit(query_list, "watch").await
    }

    // 根据基金代码查找基金
    pub async fn find_by_code(code: &str) -> Result<HttpResponse, String> {
        info!("find by code: {}", code);
        if code.is_empty() {
            return Ok(get_error_response("根据基金代码查找基金失败, `fundCode` 不能为空"));
        }

        let sql = String::from(
            r#"
             SELECT id,
                user_id,
                name,
                code,
                alias_name,
                is_pinned,
                sort_order,
                exchange,
                market,
                type AS _type,
                create_time,
                update_time
            FROM my_watchlist
            where code = ?
        "#,
        );

        let query = sqlx::query_as::<_, MyWatchList>(&sql).bind(code);
        DBHelper::execute_query(query).await
    }

    // 根据基金代码批量查找基金
    pub async fn find_by_codes(codes: &Vec<String>) -> Result<HttpResponse, String> {
        info!("find by codes: {:#?}", codes);
        if codes.is_empty() {
            return Ok(get_error_response("根据基金代码批量查找基金失败, `fundCodes` 不能为空"));
        }

        let placeholders = codes.iter().map(|_| "?").collect::<Vec<_>>().join(",");

        let sql = format!(
            r#"
           SELECT id,
               user_id,
               name,
               code,
               alias_name,
               is_pinned,
               sort_order,
               exchange,
               market,
               type as _type,
               create_time,
               update_time
            FROM my_watchlist
            WHERE code IN ({})
           "#,
            placeholders
        );

        let mut query = sqlx::query_as::<_, MyWatchList>(&sql);
        for code in codes {
            query = query.bind(code);
        }

        DBHelper::execute_query(query).await
    }

    /**
      查找自选列表
    */
    pub async fn query_list() -> Result<HttpResponse, String> {
        let sql = String::from(
            r#"
            SELECT
                id,
                user_id,
                name,
                code,
                alias_name,
                is_pinned,
                sort_order,
                exchange,
                market,
                type as _type,
                create_time,
                update_time
            FROM
                my_watchlist
            ORDER BY create_time DESC
           "#,
        );

        let query = sqlx::query_as::<_, MyWatchList>(&sql);
        DBHelper::execute_query(query).await
    }

    /**
     根据 groupId 查找
    */
    pub async fn query_list_by_group_id(group_id: &str) -> Result<HttpResponse, String> {
        let sql = String::from(
            r#"
                SELECT
                    w.id,
                    w.user_id,
                    w.name,
                    w.code,
                    w.alias_name,
                    w.is_pinned,
                    w.sort_order,
                    w.exchange,
                    w.market,
                    w.type AS _type,
                    w.create_time,
                    w.update_time
                FROM
                    my_watchlist w
                INNER JOIN
                    my_watch_group_relation r
                ON
                    w.id = r.watchlist_id
                WHERE
                    r.group_id = ?
                ORDER BY create_time ASC
           "#,
        );

        let query = sqlx::query_as::<_, MyWatchList>(&sql).bind(group_id);
        DBHelper::execute_query(query).await
    }
}
