/*!
  定义变量
*/

use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};

#[derive(Default, Debug, Clone, Copy, Serialize, PartialEq, Eq)]
pub enum QueryType {
    #[serde(rename = "minute")]
    Minute,

    #[serde(rename = "fiveday")]
    FiveDay,

    #[serde(rename = "kline")]
    Kline,

    #[default]
    #[serde(rename = "none")]
    None,
}

impl QueryType {
    pub fn as_str(&self) -> &str {
        match self {
            Self::Minute => "minute",
            Self::FiveDay => "fiveday",
            Self::Kline => "kline",
            Self::None => "",
        }
    }
}

impl<'de> Deserialize<'de> for QueryType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = String::deserialize(deserializer)?;

        match value.as_str() {
            "minute" => Ok(Self::Minute),
            "fiveday" => Ok(Self::FiveDay),
            "kline" => Ok(Self::Kline),
            "none" | "" => Ok(Self::None),
            _ => Err(serde::de::Error::custom(format!("invalid query type: {}", value))),
        }
    }
}

#[derive(Default, Debug, Clone, Copy, Serialize, PartialEq, Eq)]
pub enum KlineType {
    #[serde(rename = "day")]
    Day,

    #[serde(rename = "week")]
    Week,

    #[serde(rename = "month")]
    Month,

    #[serde(rename = "quarter")]
    Quarter,

    #[serde(rename = "year")]
    Year,

    #[serde(rename = "min1")]
    Min1,

    #[serde(rename = "min5")]
    Min5,

    #[serde(rename = "min15")]
    Min15,

    #[serde(rename = "min30")]
    Min30,

    #[serde(rename = "min60")]
    Min60,

    #[default]
    #[serde(rename = "none")]
    None,
}

impl<'de> Deserialize<'de> for KlineType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = String::deserialize(deserializer)?;

        match value.as_str() {
            "day" => Ok(Self::Day),
            "week" => Ok(Self::Week),
            "month" => Ok(Self::Month),
            "quarter" => Ok(Self::Quarter),
            "year" => Ok(Self::Year),
            "min1" => Ok(Self::Min1),
            "min5" => Ok(Self::Min5),
            "min15" => Ok(Self::Min15),
            "min30" => Ok(Self::Min30),
            "min60" => Ok(Self::Min60),
            "none" | "" => Ok(Self::None),
            _ => Err(serde::de::Error::custom(format!("invalid kline type: {}", value))),
        }
    }
}

impl KlineType {
    // JSON / 前端使用
    pub fn as_str(&self) -> &str {
        match self {
            Self::Day => "day",
            Self::Week => "week",
            Self::Month => "month",
            Self::Quarter => "quarter",
            Self::Year => "year",
            Self::Min1 => "min1",
            Self::Min5 => "min5",
            Self::Min15 => "min15",
            Self::Min30 => "min30",
            Self::Min60 => "min60",
            Self::None => "",
        }
    }

    // 数据库使用
    pub fn period(&self) -> Option<&str> {
        match self {
            Self::Day => Some("DAY"),
            Self::Week => Some("WEEK"),
            Self::Month => Some("MONTH"),
            Self::Quarter => Some("QUARTER"),
            Self::Year => Some("YEAR"),
            Self::Min1 => Some("MIN1"),
            Self::Min5 => Some("MIN5"),
            Self::Min15 => Some("MIN15"),
            Self::Min30 => Some("MIN30"),
            Self::Min60 => Some("MIN60"),
            Self::None => None,
        }
    }
}

// 类型
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum MarketType {
    Stock,
    Etf,
    Fund,
    #[default]
    Unknown,
}

impl MarketType {
    pub fn as_str(&self) -> &'static str {
        match self {
            MarketType::Stock => "stock",
            MarketType::Etf => "etf",
            MarketType::Fund => "fund",
            MarketType::Unknown => "",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum HotStockType {
    /// 热股
    Stock,
    /// 热搜
    Search,
    /// 版块
    Plate,
    /// 舆情
    Sentiment,
    /// 诊股
    Analysis,
    /// 机构
    Institution,
}

// 输出变量
#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct Args {
    #[serde(rename = "market")]
    pub market: String,

    #[serde(rename = "code")]
    pub code: String,

    #[serde(rename = "marketType")]
    pub market_type: MarketType,

    #[serde(rename = "queryType")]
    pub query_type: QueryType, // 查询类型: minute, fiveday, kline

    #[serde(rename = "klineType")]
    pub k_line_type: KlineType, // day, week, month, quarter, year

    #[serde(rename = "exchange")]
    pub exchange: Option<String>,
}
