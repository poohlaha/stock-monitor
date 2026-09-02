/*!
 股票每日行情及盘口指标表(stock_quote_daily)
*/

use crate::database::helper::DBHelper;
use crate::LOGGER_PREFIX;
use chrono::NaiveDate;
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, MySql};
use uuid::Uuid;

#[derive(Default, Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct StockQuoteDailyArgs {
    #[serde(rename = "id")]
    pub id: Option<String>, // ID

    #[serde(rename = "assetId")]
    pub asset_id: String, // 资产ID

    #[serde(rename = "tradeDate")]
    pub trade_date: NaiveDate, // 交易日期

    // ==================== 价格行情 ====================
    #[serde(rename = "open")]
    pub open: Decimal, // 今开价，单位：元

    #[serde(rename = "high")]
    pub high: Decimal, // 当日最高价，单位：元

    #[serde(rename = "low")]
    pub low: Decimal, // 当日最低价，单位：元

    #[serde(rename = "preClose")]
    pub pre_close: Decimal, // 当日收盘价，单位：元

    #[serde(rename = "avgPrice")]
    pub avg_price: Decimal, // 当日成交均价，单位：元

    #[serde(rename = "limitUp")]
    pub limit_up: Decimal, // 当日涨停价，单位：元

    #[serde(rename = "limitDown")]
    pub limit_down: Decimal, // 今开跌停价，单位：元

    #[serde(rename = "priceChange")]
    pub price_change: Decimal, // 当日涨跌额，单位：元

    #[serde(rename = "priceChangeRatio")]
    pub price_change_ratio: Decimal, // 当日涨跌幅，单位：百分比，例如-0.99表示-0.99%

    #[serde(rename = "amplitudeRatio")]
    pub amplitude_ratio: Decimal, // 当日振幅，单位：百分比

    // ==================== 成交数据 ====================
    #[serde(rename = "volume")]
    pub volume: i32, // 当日累计成交量，单位：股

    #[serde(rename = "amount")]
    pub amount: Decimal, // 当日累计成交额，单位：元

    #[serde(rename = "turnoverRatio")]
    pub turnover_ratio: Decimal, // 换手率，单位：百分比

    #[serde(rename = "volumeRatio")]
    pub volume_ratio: Decimal, // 量比

    #[serde(rename = "inside")]
    pub inside: i32, // 内盘成交量，单位：股

    #[serde(rename = "outside")]
    pub outside: i32, // 外盘成交量，单位：股

    #[serde(rename = "weibiRatio")]
    pub weibi_ratio: Decimal, // 委比，单位：百分比

    // ==================== 估值指标 ====================
    #[serde(rename = "peTtm")]
    pub pe_ttm: Decimal, // 市盈率TTM，滚动市盈率

    #[serde(rename = "peLyr")]
    pub pe_lyr: Decimal, // 市盈率LYR，静态市盈率

    #[serde(rename = "pb")]
    pub pb: Decimal, // 市净率

    #[serde(rename = "ps")]
    pub ps: Decimal, // 市销率

    // ==================== 市值及股本 ====================
    #[serde(rename = "marketCap")]
    pub market_cap: Decimal, // 总市值，单位：元

    #[serde(rename = "circulatingMarketCap")]
    pub circulating_market_cap: Decimal, // 流通市值，单位：元

    #[serde(rename = "totalShareCapital")]
    pub total_share_capital: i32, // 总股本，单位：股

    #[serde(rename = "circulatingShareCapital")]
    pub circulating_share_capital: i32, // 流通股本，单位：股

    // ==================== 52周行情 ====================
    #[serde(rename = "week52High")]
    pub week52_high: Decimal, // 52周最高价，单位：元

    #[serde(rename = "week52Low")]
    pub week52_low: Decimal, // 52周最低价，单位：元

    // ==================== 时间 ====================
    #[serde(rename = "createTime")]
    pub create_time: Option<String>,

    #[serde(rename = "updateTime")]
    pub update_time: Option<String>,
}

pub struct StockQuoteDaily;

impl StockQuoteDaily {
    pub async fn batch_add(args_list: Vec<StockQuoteDailyArgs>) -> Result<bool, String> {
        if args_list.is_empty() {
            return Ok(false);
        }

        let mut query_list = Vec::new();
        let time = handlers::utils::Utils::get_date(None);
        for args in args_list {
            if args.asset_id.is_empty() {
                info!("{} stock quote daily skip, `asset_id` is empty", LOGGER_PREFIX);
                continue;
            }

            let query = sqlx::query::<MySql>(
                r#"
                INSERT INTO stock_quote_daily(
                    id,
                    asset_id,
                    trade_date,
                    `open`,
                    high,
                    low,
                    pre_close,
                    avg_price,
                    limit_up,
                    limit_down,
                    price_change,
                    price_change_ratio,
                    amplitude_ratio,
                    volume,
                    amount,
                    turnover_ratio,
                    volume_ratio,
                    inside,
                    outside,
                    weibi_ratio,
                    pe_ttm,
                    pe_lyr,
                    pb,
                    ps,
                    market_cap,
                    circulating_market_cap,
                    total_share_capital,
                    circulating_share_capital,
                    week52_high,
                    week52_low,
                    create_time,
                    update_time
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                `open` = VALUES(`open`),
                high = VALUES(high),
                low = VALUES(low),
                pre_close = VALUES(pre_close),
                avg_price = VALUES(avg_price),
                limit_up = VALUES(limit_up),
                limit_down = VALUES(limit_down),
                price_change = VALUES(price_change),
                price_change_ratio = VALUES(price_change_ratio),
                amplitude_ratio = VALUES(amplitude_ratio),
                volume = VALUES(volume),
                amount = VALUES(amount),
                turnover_ratio = VALUES(turnover_ratio),
                volume_ratio = VALUES(volume_ratio),
                inside = VALUES(inside),
                outside = VALUES(outside),
                weibi_ratio = VALUES(weibi_ratio),
                pe_ttm = VALUES(pe_ttm),
                pe_lyr = VALUES(pe_lyr),
                pb = VALUES(pb),
                ps = VALUES(ps),
                market_cap = VALUES(market_cap),
                circulating_market_cap = VALUES(circulating_market_cap),
                total_share_capital = VALUES(total_share_capital),
                circulating_share_capital = VALUES(circulating_share_capital),
                week52_high = VALUES(week52_high),
                week52_low = VALUES(week52_low),
                update_time = VALUES(update_time)
            "#,
            )
            .bind(Uuid::new_v4().to_string())
            .bind(args.asset_id)
            .bind(args.trade_date)
            .bind(args.open)
            .bind(args.high)
            .bind(args.low)
            .bind(args.pre_close)
            .bind(args.avg_price)
            .bind(args.limit_up)
            .bind(args.limit_down)
            .bind(args.price_change)
            .bind(args.price_change_ratio)
            .bind(args.amplitude_ratio)
            .bind(args.volume)
            .bind(args.amount)
            .bind(args.turnover_ratio)
            .bind(args.volume_ratio)
            .bind(args.inside)
            .bind(args.outside)
            .bind(args.weibi_ratio)
            .bind(args.pe_ttm)
            .bind(args.pe_lyr)
            .bind(args.pb)
            .bind(args.ps)
            .bind(args.market_cap)
            .bind(args.circulating_market_cap)
            .bind(args.total_share_capital)
            .bind(args.circulating_share_capital)
            .bind(args.week52_high)
            .bind(args.week52_low)
            .bind(time.clone())
            .bind(time.clone());

            query_list.push(query);
        }

        DBHelper::batch(query_list, "quote").await
    }
}
