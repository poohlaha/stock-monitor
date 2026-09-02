/*!
资产K线行情数据表，存储股票、ETF等资产的日K、周K、月K等周期行情数据，包括开盘价、收盘价、最高价、最低价、成交量、成交额、涨跌幅、换手率及各周期均线数据(asset_kline)
*/

use crate::database::helper::DBHelper;
use crate::stock::variable::KlineType;
use crate::LOGGER_PREFIX;
use chrono::NaiveDate;
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct KlineArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "period")]
    pub period: String, // K线周期

    #[serde(rename = "tradeDate")]
    pub trade_date: NaiveDate, // K线对应的交易日期；日K为交易日，周K为该周对应日期，月K为该月对应日期

    #[serde(rename = "timestamp")]
    pub timestamp: i32, // K线时间戳，Unix时间戳，单位由数据源定义

    #[serde(rename = "open")]
    pub open: Decimal, // 开盘价

    #[serde(rename = "close")]
    pub close: Decimal, // 收盘价

    #[serde(rename = "high")]
    pub high: Decimal, // 最高价

    #[serde(rename = "low")]
    pub low: Decimal, // 最低价

    #[serde(rename = "volume")]
    pub volume: Decimal, // 成交量，单位以数据源返回值为准

    #[serde(rename = "amount")]
    pub amount: Decimal, // 成交额，单位以数据源返回值为准

    #[serde(rename = "range")]
    pub range: Decimal, // 涨跌额，相对于上一周期收盘价的价格变动

    #[serde(rename = "ratio")]
    pub ratio: Decimal, // 涨跌幅，单位为百分比，例如-4.02表示下跌4.02%'

    #[serde(rename = "turnoverRatio")]
    pub turnover_ratio: Decimal, // 换手率，单位为百分比

    #[serde(rename = "preClose")]
    pub pre_close: Decimal, // 上一交易日/上一K线周期收盘价

    #[serde(rename = "ma5AvgPrice")]
    pub ma5_avg_price: Decimal, // 5周期均线价格

    #[serde(rename = "ma5Volume")]
    pub ma5_volume: Decimal, // 5周期平均成交量

    #[serde(rename = "ma10AvgPrice")]
    pub ma10_avg_price: Decimal, // 10周期均线价格

    #[serde(rename = "ma10Volume")]
    pub ma10_volume: Decimal, // 10周期平均成交量

    #[serde(rename = "ma20AvgPrice")]
    pub ma20_avg_price: Decimal, // 20周期均线价格

    #[serde(rename = "ma20Volume")]
    pub ma20_volume: Decimal, // 20周期平均成交量

    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

// 五日
#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct FiveDayKlineArgs {
    #[serde(rename = "timestamp")]
    pub timestamp: i32, // 时间戳

    #[serde(rename = "time")]
    pub time: String, // 时间

    #[serde(rename = "price")]
    pub price: Decimal, //

    #[serde(rename = "avgPrice")]
    pub avg_price: Decimal, // 均价

    #[serde(rename = "range")]
    pub range: Decimal, // 涨跌额，相对于上一周期收盘价的价格变动

    #[serde(rename = "ratio")]
    pub ratio: Decimal, // 涨跌幅，单位为百分比，例如-4.02表示下跌4.02%'

    #[serde(rename = "volume")]
    pub volume: Decimal, // 成交量，单位以数据源返回值为准

    #[serde(rename = "amount")]
    pub amount: Decimal, // 成交额，单位以数据源返回值为准
}

pub struct Kline;

impl Kline {
    pub async fn batch_add(args_list: Vec<KlineArgs>) -> Result<bool, String> {
        if args_list.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);

        for args in args_list {
            if args.asset_id.is_empty() {
                info!("{} stock kline skip, `asset_id` is empty", LOGGER_PREFIX);
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO asset_kline (
                    id,
                    asset_id,
                    period,
                    trade_date,
                    timestamp,
                    open,
                    close,
                    high,
                    low,
                    volume,
                    amount,
                    `range`,
                    ratio,
                    turnover_ratio,
                    pre_close,
                    ma5_avg_price,
                    ma5_volume,
                    ma10_avg_price,
                    ma10_volume,
                    ma20_avg_price,
                    ma20_volume,
                    create_time,
                    update_time
                )
                VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
                ON DUPLICATE KEY UPDATE
                    `timestamp` = VALUES(`timestamp`),
                    `open` = VALUES(`open`),
                    `close` = VALUES(`close`),
                    `high` = VALUES(`high`),
                    low = VALUES(low),
                    volume = VALUES(volume),
                    amount = VALUES(amount),
                    `range` = VALUES(`range`),
                    ratio = VALUES(ratio),
                    turnover_ratio = VALUES(turnover_ratio),
                    pre_close = VALUES(pre_close),
                    ma5_avg_price = VALUES(ma5_avg_price),
                    ma5_volume = VALUES(ma5_volume),
                    ma10_avg_price = VALUES(ma10_avg_price),
                    ma10_volume = VALUES(ma10_volume),
                    ma20_avg_price = VALUES(ma20_avg_price),
                    ma20_volume = VALUES(ma20_volume),
                    update_time = VALUES(update_time)
                "#,
            )
            .bind(args.id.clone().unwrap_or_else(|| Uuid::new_v4().to_string()))
            .bind(args.asset_id.clone())
            .bind(args.period)
            .bind(args.trade_date)
            .bind(args.timestamp)
            .bind(args.open)
            .bind(args.close)
            .bind(args.high)
            .bind(args.low)
            .bind(args.volume)
            .bind(args.amount)
            .bind(args.range)
            .bind(args.ratio)
            .bind(args.turnover_ratio)
            .bind(args.pre_close)
            .bind(args.ma5_avg_price)
            .bind(args.ma5_volume)
            .bind(args.ma10_avg_price)
            .bind(args.ma10_volume)
            .bind(args.ma20_avg_price)
            .bind(args.ma20_volume)
            .bind(&time)
            .bind(&time);

            query_list.push(query);
        }

        Ok(true)
    }

    // 根据 asset_id 和 k_line_type 查询
    pub async fn query_by_asset_id_and_k_line_type(asset_id: &str, k_line_type: KlineType) -> Result<Vec<KlineArgs>, String> {
        if asset_id.is_empty() || k_line_type == KlineType::None {
            return Ok(Vec::new());
        }

        let period = match k_line_type.period() {
            Some(period) => period,
            None => return Ok(Vec::new()),
        };

        let sql = r#"
                SELECT
                    *
                FROM
                    asset_kline
                WHERE
                    asset_id = ?
                AND
                    period = ?
                ORDER BY trade_date ASC
            "#;

        let query = sqlx::query_as::<_, KlineArgs>(sql).bind(asset_id).bind(period);
        DBHelper::execute(query).await
    }
}
