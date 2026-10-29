/*!
  股票基本信息表(stock_info)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use chrono::NaiveDate;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockInfoArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "stockCode")]
    pub stock_code: String, // 股票代码

    #[serde(rename = "releaseDate")]
    pub release_date: Option<NaiveDate>, // 上市日期

    #[serde(rename = "issuePrice")]
    pub issue_price: Decimal, // 发行价格

    #[serde(rename = "issueNumber")]
    pub issue_number: Decimal, // 发行数量

    #[serde(rename = "region")]
    pub region: String, // 所属地区

    #[serde(rename = "mainBusiness")]
    pub main_business: String, // 主营业务|公司介绍

    #[serde(rename = "industry")]
    pub industry: String, // 行业/板块

    #[serde(rename = "chineseName")]
    pub chinese_name: String, // 中文名

    #[serde(rename = "englishName")]
    pub english_name: String, // 英文名

    #[serde(rename = "exchange")]
    pub exchange: String, // 交易所

    #[serde(rename = "circulatingShares")]
    pub circulating_shares: Decimal, // 流通股本

    #[serde(rename = "establishedDate")]
    pub established_date: Option<NaiveDate>, // 成立时间

    #[serde(rename = "website")]
    pub website: String, // 公司网址

    #[serde(rename = "companyPhone")]
    pub company_phone: String, // 公司电话

    #[serde(rename = "companyAddress")]
    pub company_address: String, // 公司地址

    #[serde(rename = "businessDescription")]
    pub business_description: String, // 业务描述

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct StockInfo;

impl StockInfo {
    pub async fn batch_add(asset_id: &str, args_list: Vec<StockInfoArgs>) -> Result<bool, String> {
        if asset_id.is_empty() || args_list.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO stock_info (
                    id,
                    asset_id,
                    stock_code,
                    release_date,
                    issue_price,
                    issue_number,
                    region,
                    main_business,
                    industry,
                    chinese_name,
                    english_name,
                    exchange,
                    circulating_shares,
                    established_date,
                    website,
                    company_phone,
                    company_address,
                    business_description,
                    create_time,
                    update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    `stock_code` = VALUES(`stock_code`),
                    release_date = VALUES(release_date),
                    issue_price = VALUES(issue_price),
                    issue_number = VALUES(issue_number),
                    region = VALUES(region),
                    main_business = VALUES(main_business),
                    industry = VALUES(industry),
                    chinese_name = VALUES(chinese_name),
                    english_name = VALUES(english_name),
                    exchange = VALUES(exchange),
                    circulating_shares = VALUES(circulating_shares),
                    established_date = VALUES(established_date),
                    website = VALUES(website),
                    company_phone = VALUES(company_phone),
                    company_address = VALUES(company_address),
                    business_description = VALUES(business_description),
                    update_time = VALUES(update_time)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.stock_code)
            .bind(args.release_date)
            .bind(args.issue_price)
            .bind(args.issue_number)
            .bind(args.region)
            .bind(args.main_business)
            .bind(args.industry)
            .bind(args.chinese_name)
            .bind(args.english_name)
            .bind(args.exchange)
            .bind(args.circulating_shares)
            .bind(args.established_date)
            .bind(args.website)
            .bind(args.company_phone)
            .bind(args.company_address)
            .bind(args.business_description)
            .bind(time.clone())
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "info").await
    }

    // 根据资产ID查询股票信息
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Option<StockInfoArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                stock_info
            WHERE
                asset_id = ?
            LIMIT 1
        "#;

        let query = sqlx::query_as::<_, StockInfoArgs>(sql).bind(asset_id);
        DBHelper::execute_query_one(query).await
    }
}
