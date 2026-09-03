/*!
  基金经理信息表，记录基金经理基本资料、从业经历及历史业绩指标(fund_manager)
  基金经理关系表，记录基金经理管理基金的历史关系，包括在管和离任基金(fund_manager_relation)
*/

use crate::database::helper::DBHelper;
use crate::error::Error;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use std::collections::HashMap;
use futures::TryFutureExt;
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundManagerArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "managerCode")]
    pub manager_code: String, // 第三方经理ID

    #[serde(rename = "name")]
    pub name: String, // 基金经理名称

    #[serde(rename = "avatar")]
    pub avatar: String, // 基金经理头像

    #[serde(rename = "company")]
    pub company: String, // 所属基金公司

    #[serde(rename = "description")]
    pub description: String, // 基金经理简介

    #[serde(rename = "resume")]
    pub resume: String, // 基金经理详细履历

    #[serde(rename = "workingYears")]
    pub working_years: Decimal, // 证券从业年限(年)

    #[serde(rename = "manageScale")]
    pub manage_scale: Decimal, // 当前管理基金规模(亿元)

    #[serde(rename = "earningRate")]
    pub earning_rate: Decimal, // 任期累计收益率(%)

    #[serde(rename = "averageReturn")]
    pub average_return: Decimal, // 平均年化收益率(%)

    #[serde(rename = "maxDrawdown")]
    pub max_drawdown: Decimal, // 最大回撤(%)

    #[serde(rename = "topReport")]
    pub top_report: Decimal, // 任期最高收益率(%)

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct FundManagerRelationArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "managerId")]
    pub manager_id: String, // 基金经理ID

    #[serde(rename = "fundCode")]
    pub fund_code: String, // 基金代码

    #[serde(rename = "fundName")]
    pub fund_name: String, // 基金名称

    #[serde(rename = "fundType")]
    pub fund_type: String, // 基金类型

    #[serde(rename = "manageType")]
    pub manage_type: i8, // 管理类型: 1-在管基金 2-离任基金

    #[serde(rename = "startDate")]
    pub start_date: String, // 开始管理日期

    #[serde(rename = "endDate")]
    pub end_date: Option<String>, // 结束管理日期

    #[serde(rename = "managePeriod")]
    pub manage_period: String, // 管理期间,例如:25.10.31--至今

    #[serde(rename = "periodReturn")]
    pub period_return: Decimal, // 任职期间收益率(%)

    #[serde(rename = "periodRank")]
    pub period_rank: String, // 任职期间同类排名

    #[serde(rename = "manageDays")]
    pub manage_days: i32, // 管理天数

    #[serde(rename = "periodYears")]
    pub period_years: Decimal, // 任职年限

    #[serde(rename = "earningRate")]
    pub earning_rate: Decimal, // 任期回报

    #[serde(rename = "yearlyReturn")]
    pub yearly_return: Decimal, // 年化回报

    #[serde(rename = "reportDate")]
    pub report_date: String, // 报告日期

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct FundManagerInfo {
    pub manager: FundManagerArgs,

    #[serde(rename = "currentList")]
    pub current_list: Vec<FundManagerRelationArgs>, // 现任基金

    #[serde(rename = "historyList")]
    pub history_list: Vec<FundManagerRelationArgs>, // 离任基金
}

pub struct FundManager {}

impl FundManager {
    // 批量添加
    pub async fn batch_add(asset_id: &str, args_list: Vec<FundManagerArgs>, relation_args_list: Vec<FundManagerRelationArgs>) -> Result<bool, String> {
        if args_list.is_empty() || relation_args_list.is_empty() || asset_id.is_empty() {
            return Ok(false);
        }

        let mut manager_id_map = HashMap::new();
        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        // 1. 基金经理表
        for args in args_list {
            let manager = Self::get_by_code(&args.manager_code).await?;
            let old_id = args.id.clone().unwrap_or_default();
            let manager_id = match manager {
                None => {
                    args.id.clone().unwrap_or_else(|| Uuid::new_v4().to_string())
                }
                Some(manager) => {
                     manager.id.clone().unwrap_or_else(|| Uuid::new_v4().to_string())
                }
            };

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_manager(id, manager_code, name, avatar, company, description, resume, working_years, manage_scale, earning_rate, average_return, max_drawdown, top_report, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                `name` = VALUES(`name`),
                avatar = VALUES(avatar),
                company = VALUES(company),
                description = VALUES(description),
                resume = VALUES(resume),
                working_years = VALUES(working_years),
                manage_scale = VALUES(manage_scale),
                earning_rate = VALUES(earning_rate),
                average_return = VALUES(average_return),
                max_drawdown = VALUES(max_drawdown),
                top_report = VALUES(top_report),
                update_time = NOW()
            "#,
            )
            .bind(manager_id.clone())
            .bind(args.manager_code.clone())
            .bind(args.name)
            .bind(args.avatar)
            .bind(args.company)
            .bind(args.description)
            .bind(args.resume)
            .bind(args.working_years)
            .bind(args.manage_scale)
            .bind(args.earning_rate)
            .bind(args.average_return)
            .bind(args.max_drawdown)
            .bind(args.top_report)
            .bind(time.clone());

            manager_id_map.insert(old_id, manager_id);
            query_list.push(query);
        }

        // 2. 基金经理关联表
        let delete_relation_query = sqlx::query::<MySql>(
            r#"
                DELETE FROM
                      fund_manager_relation
                WHERE
                    asset_id = ?
            "#,
        )
        .bind(asset_id);

        query_list.push(delete_relation_query);

        let mut relation_query_list = Vec::new();
        for relation in relation_args_list {
            let manager_id = match manager_id_map.get(&relation.manager_id) {
                None => relation.manager_id.clone(),
                Some(manager_id) => manager_id.clone(),
            };

            if manager_id.is_empty() {
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO fund_manager_relation(id, asset_id, manager_id, fund_code, fund_name, fund_type, manage_type, start_date, end_date, manage_period, period_return, period_rank, manage_days, period_years, earning_rate, yearly_return, report_date, create_time)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(relation.asset_id)
            .bind(manager_id)
            .bind(relation.fund_code)
            .bind(relation.fund_name)
            .bind(relation.fund_type)
            .bind(relation.manage_type)
            .bind(relation.start_date)
            .bind(relation.end_date)
            .bind(relation.manage_period)
            .bind(relation.period_return)
            .bind(relation.period_rank)
            .bind(relation.manage_days)
            .bind(relation.period_years)
            .bind(relation.earning_rate)
            .bind(relation.yearly_return)
            .bind(relation.report_date)
            .bind(time.clone());

            relation_query_list.push(query);
        }

        if relation_query_list.is_empty() {
            return Ok(false)
        }

       query_list.extend(relation_query_list);
        DBHelper::batch(query_list, "manager").await
    }

    // 根据 manager_id 查询经理
    pub async fn get_by_id(manager_id: &str) -> Result<Option<FundManagerArgs>, String> {
        if manager_id.is_empty() {
            return Err(Error::Error(String::from("`manager_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_manager
            WHERE
                id = ?
            LIMIT 1
        "#;

        let query = sqlx::query_as::<_, FundManagerArgs>(sql).bind(manager_id);
        DBHelper::execute_query_one(query).await
    }

    // 根据 manager_code 查询经理
    pub async fn get_by_code(manager_code: &str) -> Result<Option<FundManagerArgs>, String> {
        if manager_code.is_empty() {
            return Err(Error::Error(String::from("`manager_code` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_manager
            WHERE
                manager_code = ?
            LIMIT 1
        "#;

        let query = sqlx::query_as::<_, FundManagerArgs>(sql).bind(manager_code);
        DBHelper::execute_query_one(query).await
    }

    // 根据基金资产ID查询关联关系
    pub async fn get_relation_by_asset_id(asset_id: &str) -> Result<Vec<FundManagerRelationArgs>, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let sql = r#"
            SELECT
                *
            FROM
                fund_manager_relation
            WHERE
                asset_id = ?
            ORDER BY
                manage_type ASC,
                start_date DESC
        "#;

        let query = sqlx::query_as::<_, FundManagerRelationArgs>(sql).bind(asset_id);
        DBHelper::execute(query).await
    }

    // 根据基金资产ID查询基金经理信息
    pub async fn get_by_asset_id(asset_id: &str) -> Result<Vec<FundManagerInfo>, String> {
        let relations = Self::get_relation_by_asset_id(asset_id).await?;
        let mut map: HashMap<String, FundManagerInfo> = HashMap::new();

        for relation in relations {
            let entry = map.entry(relation.manager_id.clone()).or_insert_with(|| FundManagerInfo {
                manager: FundManagerArgs::default(),
                current_list: Vec::new(),
                history_list: Vec::new(),
            });

            if relation.manage_type == 1 {
                entry.current_list.push(relation);
            } else {
                entry.history_list.push(relation);
            }
        }

        for (_, item) in map.iter_mut() {
            if item.manager.id.is_none() {
                if let Some(id) = item.current_list.first().or(item.history_list.first()).map(|x| x.manager_id.clone()) {
                    let manager = FundManager::get_by_id(&id).await?;

                    if let Some(manager) = manager {
                        item.manager = manager;
                    }
                }
            }
        }

        Ok(map.into_values().collect())
    }
}
