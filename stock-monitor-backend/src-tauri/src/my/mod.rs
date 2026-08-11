//! 我的自选

use crate::database::helper::DBHelper;
use crate::prepare::{get_error_response, HttpResponse};
use chrono::Utc;
use handlers::utils::Utils;
use log::info;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    #[serde(rename = "fundCode")]
    pub fund_code: String, // 基金名称

    #[serde(rename = "fundName")]
    pub fund_name: String, // 基金代码

    #[serde(rename = "exchange")]
    pub exchange: i32, // 排序

    #[serde(rename = "fundType")]
    pub fund_type: i32, // 排序

    #[serde(rename = "market")]
    pub market: i32, // 排序
}

// 我的基金
#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MyFundWatch {
    pub id: String, // 主键

    #[serde(rename = "userId")]
    pub user_id: Option<String>, // 用户ID

    #[serde(rename = "fundCode")]
    pub fund_code: String, // 基金名称

    #[serde(rename = "fundName")]
    pub fund_name: String, // 基金代码

    #[serde(rename = "aliasName")]
    pub alias_name: Option<String>, // 自定义名称

    #[serde(rename = "groupName")]
    pub group_name: Option<String>, // 分组

    #[serde(rename = "isPinned")]
    pub is_pinned: bool, // 是否置顶

    #[serde(rename = "sortOrder")]
    pub sort_order: i32, // 排序

    #[serde(rename = "exchange")]
    pub exchange: String, // 排序

    #[serde(rename = "fundType")]
    pub fund_type: String, // 排序

    #[serde(rename = "market")]
    pub market: String, // 排序

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct MyFund;

impl MyFund {
    // 添加
    pub async fn add(args: &Args) -> Result<HttpResponse, String> {
        info!("save my fund params: {:#?}", args);
        if args.fund_name.is_empty() || args.fund_code.is_empty() {
            return Ok(get_error_response("添加的自选失败, `fundCode` 和 `fundName` 不能为空"));
        }

        let time = Utils::get_date(None);
        let query = sqlx::query::<MySql>("INSERT INTO my_fund_watchlist(id, fund_code, fund_name, exchange, fund_type, market, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(Uuid::new_v4().to_string())
            .bind(&args.fund_code)
            .bind(&args.fund_name)
            .bind(&args.exchange)
            .bind(&args.fund_type)
            .bind(&args.market)
            .bind(&time);

        DBHelper::execute_update(query).await
    }

    // 根据基金代码查找基金
    pub async fn find_by_fund_code(fund_code: &str) -> Result<HttpResponse, String> {
        info!("find by fund code: {}", fund_code);
        if fund_code.is_empty() {
            return Ok(get_error_response("根据基金代码查找基金失败, `fundCode` 不能为空"));
        }

        let sql = String::from(
            r#"
            SELECT id,
            user_id,
            fund_name,
            fund_code,
            alias_name,
            group_name,
            is_pinned,
            sort_order,
            exchange,
            market,
            fund_type,
            create_time,
            update_time
            FROM my_fund_watchlist
            where fund_code = ?
        "#,
        );

        let query = sqlx::query_as::<_, MyFundWatch>(&sql).bind(fund_code);
        DBHelper::execute_query(query).await
    }

    // 根据基金代码批量查找基金
    pub async fn find_by_fund_codes(fund_codes: &Vec<String>) -> Result<HttpResponse, String> {
        info!("find by fund codes: {:#?}", fund_codes);
        if fund_codes.is_empty() {
            return Ok(get_error_response("根据基金代码批量查找基金失败, `fundCodes` 不能为空"));
        }

        let placeholders = fund_codes.iter().map(|_| "?").collect::<Vec<_>>().join(",");

        let sql = format!(
            r#"
            SELECT id,
               user_id,
               fund_name,
               fund_code,
               alias_name,
               group_name,
               is_pinned,
               sort_order,
               exchange,
               market,
               fund_type,
               create_time,
               update_time
            FROM my_fund_watchlist
            WHERE fund_code IN ({})
           "#,
            placeholders
        );

        let mut query = sqlx::query_as::<_, MyFundWatch>(&sql);
        for code in fund_codes {
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
                fund_name,
                fund_code,
                alias_name,
                group_name,
                is_pinned,
                sort_order,
                exchange,
                market,
                fund_type,
                create_time,
                update_time
            FROM
                my_fund_watchlist
            ORDER BY create_time DESC
           "#,
        );

        let query = sqlx::query_as::<_, MyFundWatch>(&sql);
        DBHelper::execute_query(query).await
    }
}
