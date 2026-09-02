use rust_decimal::Decimal;
use std::str::FromStr;

pub struct Handler;

impl Handler {
    pub fn parse_percent(value: &str) -> Decimal {
        value.trim_end_matches('%').parse::<Decimal>().unwrap_or(Decimal::ZERO)
    }

    pub fn parse_decimal(value: &str) -> Decimal {
        let value = value.replace("%/年", "").replace("%年", "").replace("%", "").replace("亿", "").replace("年", "").replace("+", "");
        Decimal::from_str(&value).unwrap_or_default()
    }

    pub fn parse_i32(value: &str) -> i32 {
        value.parse::<i32>().unwrap_or(0)
    }

    // 根据 url 获取参数值
    pub fn get_query_param(url: &str, key: &str) -> Option<String> {
        let query = url.split_once('?')?.1;

        for param in query.split('&') {
            let Some((k, v)) = param.split_once('=') else {
                continue;
            };

            if k == key {
                return Some(v.to_string());
            }
        }

        None
    }
}
