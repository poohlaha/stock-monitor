/*!
  用户自选分组表，用于管理用户自选资产分类(my_watch_group)
用户自选分组关联表，维护自选资产与分组之间的关系(my_watch_group_relation)
*/

use crate::database::helper::DBHelper;
use crate::my::watch::MyWatchList;
use crate::prepare::{get_error_response, HttpResponse};
use handlers::utils::Utils;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql, Row};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "name")]
    pub name: String, // 名称
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MyWatchGroup {
    pub id: String, // 主键

    #[serde(rename = "userId")]
    pub user_id: Option<String>, // 用户ID

    #[serde(rename = "name")]
    pub name: String, // 基金名称

    #[serde(rename = "sortOrder")]
    pub sort_order: i32, // 排序

    #[serde(rename = "isDefault")]
    pub is_default: bool, // 是否默认分组

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

impl MyWatchGroup {
    // 添加
    pub async fn add(args: &Args) -> Result<HttpResponse, String> {
        if args.name.is_empty() {
            return Ok(get_error_response("创建分组失败, `name` 不能为空"));
        }

        let mut response: HttpResponse = Self::get_by_name(&args.name).await?;
        if response.code != 200 {
            response.error = String::from("创建分组失败, 该分组已存在");
            return Ok(response);
        }

        let time = Utils::get_date(None);
        let query = sqlx::query::<MySql>("INSERT INTO my_watch_group(id, name, create_time) VALUES (?, ?, ?)")
            .bind(Uuid::new_v4().to_string())
            .bind(&args.name)
            .bind(&time);

        DBHelper::execute_update(query).await
    }

    // 详情
    pub async fn get_by_id(id: &str) -> Result<HttpResponse, String> {
        let sql = String::from(
            r#"
                    SELECT id,
                        user_id,
                        name,
                        sort_order,
                        is_default,
                        create_time,
                        update_time
                    FROM my_watch_group
                    WHERE id = ?
                "#,
        );

        let query = sqlx::query_as::<_, MyWatchGroup>(&sql).bind(id);
        DBHelper::execute_query(query).await
    }

    // 根据名称查找
    pub async fn get_by_name(name: &str) -> Result<HttpResponse, String> {
        let sql = String::from(
            r#"
                    SELECT id,
                        user_id,
                        name,
                        sort_order,
                        is_default,
                        create_time,
                        update_time
                    FROM my_watch_group
                    WHERE name = ?
                "#,
        );

        let query = sqlx::query_as::<_, MyWatchGroup>(&sql).bind(name);
        DBHelper::execute_query(query).await
    }

    // 列表
    pub async fn get_list() -> Result<HttpResponse, String> {
        let sql = String::from(
            r#"
                    SELECT id,
                        user_id,
                        name,
                        sort_order,
                        is_default,
                        create_time,
                        update_time
                    FROM my_watch_group
                "#,
        );

        let query = sqlx::query_as::<_, MyWatchGroup>(&sql);
        DBHelper::execute_query(query).await
    }

    // 修改
    pub async fn update(args: &Args) -> Result<HttpResponse, String> {
        if args.name.is_empty() || args.id.is_none() {
            return Ok(get_error_response("修改分组失败, `name` 或 `id` 不能为空"));
        }

        let id = args.id.as_ref().unwrap();

        let mut response: HttpResponse = Self::get_by_id(id).await?;
        if response.code != 200 {
            response.error = String::from("修改分组失败, 该分组不存在");
            return Ok(response);
        }

        let time = Utils::get_date(None);
        let query = sqlx::query::<MySql>("UPDATE my_watch_group SET name = ?, update_time = ? WHERE id = ?")
            .bind(Uuid::new_v4().to_string())
            .bind(&args.name)
            .bind(&time)
            .bind(&id);
        DBHelper::execute_update(query).await
    }

    // 删除
    pub async fn delete(args: &Args) -> Result<HttpResponse, String> {
        if args.id.is_none() {
            return Ok(get_error_response("删除分组失败, `id` 不能为空"));
        }

        let id = args.id.as_ref().unwrap();

        let mut query_list = Vec::new();
        // 1. 删除关联关系
        let relation_query = sqlx::query::<MySql>(
            r#"
                    DELETE FROM my_watch_group_relation
                    WHERE group_id = ?
                "#,
        )
        .bind(id);

        // 2. 删除分组
        let group_query = sqlx::query::<MySql>(
            r#"
                    DELETE FROM my_watch_group
                    WHERE id = ?
                "#,
        )
        .bind(id);

        query_list.push(group_query);
        DBHelper::batch_commit(query_list, "group").await
    }

    // 查找分期
    pub async fn get_group_watch_list() -> Result<HttpResponse, String> {
        let sql = String::from(
            r#"
                SELECT
                    g.*
                FROM
                    my_watch_group g
                ORDER BY
                    g.sort_order,
                    g.create_time ASC
                "#,
        );

        let query = sqlx::query_as::<_, MyWatchGroup>(&sql);
        DBHelper::execute_query(query).await
    }

    // 查询默认分组
    pub async fn get_default_group_id() -> Result<Vec<String>, String> {
        let sql = String::from(
            r#"
                    SELECT
                        g.*
                    FROM my_watch_group g
                    Where g.is_default = 1
                    LIMIT 1
                "#,
        );

        let query = sqlx::query(&sql);
        let rows = DBHelper::execute_rows(query).await?;
        if rows.is_empty() {
            return Ok(Vec::new());
        }

        let mut group_id = String::new();
        for row in rows.iter() {
            group_id = row.try_get("id").unwrap_or(String::new());
        }

        Ok(vec![group_id])
    }
}
