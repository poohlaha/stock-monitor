//! 数据库助手

use crate::error::Error;
use crate::prepare::{get_error_response, get_success_response, HttpResponse};
use crate::{DATABASE_POOLS, LOGGER_PREFIX};
use log::error;
use serde::Serialize;
use serde_json::Value;
use sqlx::mysql::{MySqlArguments, MySqlRow};
use sqlx::query::{Query, QueryAs, QueryScalar};
use sqlx::{FromRow, MySql};
use std::future::Future;

pub struct DBHelper;

impl DBHelper {
    pub(crate) async fn execute_crud<'a>(query: Query<'a, MySql, MySqlArguments>) -> Result<bool, String> {
        let pool = Self::get_pools();

        let result = query.execute(&pool).await.map_err(|err| {
            let msg = format!("{} execute update error: {:#?}", LOGGER_PREFIX, err);
            error!("{}", msg);
            Error::Error(msg).to_string()
        });

        match result {
            Ok(_) => Ok(true),
            Err(err) => Err(Error::Error(String::from(err)).to_string()),
        }
    }

    /// 执行 update, insert, delete
    pub(crate) async fn execute_update<'a>(query: Query<'a, MySql, MySqlArguments>) -> Result<HttpResponse, String> {
        let result = Self::execute_crud(query).await;

        match result {
            Ok(_) => Ok(get_success_response(Some(Value::Bool(true)))),
            Err(err) => Ok(get_error_response(&err)),
        }
    }

    /// 执行 sql, 返回 mySqlRow
    pub(crate) async fn execute_rows<'a>(query: Query<'a, MySql, MySqlArguments>) -> Result<Vec<MySqlRow>, String> {
        let pool = Self::get_pools();

        return query.fetch_all(&pool).await.map_err(|err| {
            let msg = format!("{} execute rows error: {:#?}", LOGGER_PREFIX, err);
            error!("{}", msg);
            Error::Error(msg).to_string()
        });
    }

    pub(crate) fn get_pools() -> sqlx::Pool<MySql> {
        return {
            let pools = DATABASE_POOLS.lock().unwrap();
            pools.clone().unwrap()
        };
    }

    /// 执行 query
    pub(crate) async fn execute_query_one<'a, O>(query: QueryAs<'a, MySql, O, MySqlArguments>) -> Result<Option<O>, String>
    where
        O: Send + Unpin + for<'r> FromRow<'r, MySqlRow> + Serialize + 'static,
    {
        let pool = Self::get_pools();
        let result = query.fetch_optional(&pool).await.map_err(|err| {
            let msg = format!("{} query list error: {:#?}", LOGGER_PREFIX, err);
            error!("{}", msg);
            Error::Error(msg).to_string()
        })?;

        Ok(result)
    }

    /// 执行 query
    pub(crate) async fn execute<'a, O>(query: QueryAs<'a, MySql, O, MySqlArguments>) -> Result<Vec<O>, String>
    where
        O: Send + Unpin + for<'r> FromRow<'r, MySqlRow> + Serialize + 'static,
    {
        let pool = Self::get_pools();

        query.fetch_all(&pool).await.map_err(|err| {
            let msg = format!("{} query list error: {:#?}", LOGGER_PREFIX, err);
            error!("{}", msg);
            Error::Error(msg).to_string()
        })
    }

    /// 执行 query, 查询 count, max 等
    pub(crate) async fn fetch_scalar<'a, O>(query_scalar: QueryScalar<'a, MySql, O, MySqlArguments>) -> Result<O, String>
    where
        O: Send + Unpin + for<'r> sqlx::Decode<'r, MySql> + sqlx::Type<MySql> + 'static,
    {
        let pool = Self::get_pools();

        query_scalar.fetch_one(&pool).await.map_err(|err| {
            let msg = format!("{} query list error: {:#?}", LOGGER_PREFIX, err);
            error!("{}", msg);
            Error::Error(msg).to_string()
        })
    }

    /// 执行 query
    pub(crate) async fn execute_query<'a, O>(query: QueryAs<'a, MySql, O, MySqlArguments>) -> Result<HttpResponse, String>
    where
        O: Send + Unpin + for<'r> FromRow<'r, MySqlRow> + Serialize + 'static,
    {
        let results: Result<Vec<O>, String> = Self::execute(query).await;

        match results {
            Ok(servers) => {
                let data: Option<Value>;
                if !servers.is_empty() {
                    data = Some(serde_json::to_value(servers).map_err(|err| Error::Error(err.to_string()).to_string())?);
                } else {
                    data = Some(Value::Array(Vec::new()))
                }

                Ok(get_success_response(data))
            }
            Err(err) => Ok(get_error_response(&err)),
        }
    }

    pub(crate) async fn batch<'a>(query_list: Vec<Query<'a, MySql, MySqlArguments>>, name: &str) -> Result<bool, String> {
        let pool = Self::get_pools();

        // 开始事务
        let mut tx: sqlx::Transaction<'_, MySql> = pool.begin().await.map_err(|err| {
            let msg = format!("{} begin transaction error: {:?}", LOGGER_PREFIX, err);
            error!("{} {}", LOGGER_PREFIX, &msg);
            Error::Error(msg).to_string()
        })?;

        for query in query_list {
            query.execute(&mut *tx).await.map_err(|err| {
                let msg = format!("{} `{}` query error: {:?}", LOGGER_PREFIX, name, err);
                error!("{}", &msg);
                Error::Error(msg).to_string()
            })?;
        }

        // 提交事务
        tx.commit().await.map_err(|err| {
            let msg = format!("{} commit transaction error: {:?}", LOGGER_PREFIX, err);
            error!("{}", &msg);
            Error::Error(msg).to_string()
        })?;

        Ok(true)
    }

    /// 使用事务批量提交
    pub(crate) async fn batch_commit<'a>(query_list: Vec<Query<'a, MySql, MySqlArguments>>, name: &str) -> Result<HttpResponse, String> {
        let res = Self::batch(query_list, name).await;

        match res {
            Ok(_) => Ok(get_success_response(Some(Value::Bool(true)))),
            Err(msg) => Err(Error::Error(msg).to_string()),
        }
    }
}
