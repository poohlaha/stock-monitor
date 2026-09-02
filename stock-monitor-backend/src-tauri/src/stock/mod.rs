/*!
  股票/ETF信息
*/

use crate::asset::asset::{Asset, AssetArgs};
use crate::asset::tag::AssetTagArgs;
use crate::error::Error;
use crate::prepare::{get_success_response, get_success_response_by_value, HttpResponse};
use crate::stock::industry::{AssetIndustryArgs, StockIndustry, StockIndustryArgs};
use crate::stock::info::{StockInfo, StockInfoArgs};
use crate::stock::kline::{FiveDayKlineArgs, Kline, KlineArgs};
use crate::stock::quote::{StockQuoteDaily, StockQuoteDailyArgs};
use crate::stock::variable::{Args, MarketType, QueryType};
use crate::utils::handler::Handler;
use crate::utils::json::JsonUtils;
use crate::utils::Utils;
use crate::{BD_HTTP_URL_PREFIX, LOGGER_PREFIX};
use chrono::NaiveDate;
use log::info;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

pub mod industry;
pub mod info;
pub mod kline;
pub mod quote;
pub mod variable;

#[derive(Default, Debug, Clone, Serialize, Deserialize)]
pub struct StockInfoResult {
    #[serde(rename = "panKou")]
    pan_kou: Vec<Value>,

    #[serde(rename = "askList")]
    ask_list: Value,

    #[serde(rename = "buyList")]
    buy_list: Value,

    #[serde(rename = "detailList")]
    detail_list: Value,

    #[serde(rename = "marketData")]
    market_data: Value,

    #[serde(rename = "currency")]
    currency: Value,

    #[serde(rename = "update")]
    update: Value,
}

pub struct Stock {}

impl Stock {
    /*
      查询股票信息, 包括分时图等
      例: https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_minute_ab&query=588710&code=588710&market_type=ab&newFormat=1&name=%E5%8D%8E%E6%B3%B0%E6%9F%8F%E7%91%9E%E4%B8%8A%E8%AF%81%E7%A7%91%E5%88%9B%E6%9D%BF%E5%8D%8A%E5%AF%BC%E4%BD%93%E6%9D%90%E6%96%99%E8%AE%BE%E5%A4%87%E4%B8%BB%E9%A2%98ETF&is_kc=1&finClientType=pc&financeType=etf&finClientType=pc
    */
    pub async fn query(args: &Args) -> Result<Value, String> {
        if args.code.is_empty() {
            return Err(Error::Error(String::from("`code` is empty!")).to_string());
        }

        if args.market.is_empty() {
            return Err(Error::Error(String::from("`market` is empty!")).to_string());
        }

        let query_type = args.query_type.as_str();
        if query_type.is_empty() {
            return Err(Error::Error(String::from("`queryType` is empty!")).to_string());
        }

        let k_line_type = args.k_line_type.as_str();
        let mut url = format!(
            "{}vapi/v1/getquotation?pointType=string&group=quotation_{}_{}&query={}&code={}&market_type={}&newFormat=1&is_kc=1&financeType={}&finClientType=pc",
            BD_HTTP_URL_PREFIX,
            query_type,
            args.market,
            args.code,
            args.code,
            args.market,
            args.market_type.as_str(),
        );

        if args.query_type == QueryType::Kline {
            url = format!("{}&ktype={}", url, k_line_type);
        }

        // info!("{} request url: {}", LOGGER_PREFIX, url);

        Utils::get_response(&url).await
    }

    /*
      获取股票的信息, 包括名称、头像、标签、信息披露
    */
    pub async fn query_info(args: &Args) -> Result<HttpResponse, String> {
        let result = Self::query(args).await?;
        if JsonUtils::is_empty(&result) {
            return Ok(get_success_response(None));
        }

        // 插入资产信息
        let asset_id = Self::insert_asset_data(args, &result).await?;
        if !asset_id.is_empty() {
            // 插入股票每日行情及盘口指标
            let _ = Self::insert_quote_data(&asset_id, &result).await?;

            let _ = match args.market_type {
                MarketType::Stock => Self::insert_stock(&asset_id, args).await?,
                MarketType::Etf => true,
                _ => return Err(Error::Error(format!("stock query info: unknow `type: {}` !", args.market_type.as_str())).to_string()),
            };
        }

        // 解析实时数据
        let real_info = Self::analyze_real_time_data(&result)?;

        // 组装数据
        Self::query_stock_info(&asset_id, args, Some(real_info)).await
    }

    // 插入股票信息
    pub async fn insert_stock(asset_id: &str, args: &Args) -> Result<bool, String> {
        // 基本信息
        let result = Self::get_stock_info(args).await?;
        if result.is_null() {
            return Err(Error::Error(String::from("get stock info error, result is null !")).to_string());
        }

        let basic_info = JsonUtils::get_path(&result, &["content", "newCompany", "basicInfo"]).unwrap_or(&Value::Null);
        let code = JsonUtils::get_string(&result, "code");

        // 插入股票基本信息
        let _ = Self::insert_stock_info(asset_id, &code, &basic_info).await?;

        // 插入股票行业关系
        let _ = Self::insert_stock_industry(asset_id, &basic_info).await?;

        Ok(true)
    }

    // 插入股票基本信息
    pub async fn insert_stock_info(asset_id: &str, code: &str, basic_info: &Value) -> Result<bool, String> {
        if code.is_empty() {
            return Err(Error::Error(String::from("insert stock info error: `code` is empty!")).to_string());
        }

        let release_date = JsonUtils::get_string(basic_info, "releaseDate"); // 上市日期
        let issue_price = JsonUtils::get_string(basic_info, "issuePrice"); // 发行价格
        let issue_number = JsonUtils::get_string(basic_info, "issueNumber"); // 发行数量
        let region = JsonUtils::get_string(basic_info, "region"); // 所属地区
        let main_business = JsonUtils::get_string(basic_info, "mainBusiness"); // 主营业务

        let release_date = NaiveDate::parse_from_str(&release_date, "%Y-%m-%d").map_err(|e| e.to_string())?;
        // "20.000元" -> "20.000"
        let issue_price = issue_price.trim_end_matches("元").trim().parse::<Decimal>().map_err(|e| e.to_string())?;

        // "1667万" -> 1667
        let issue_number = issue_number.trim_end_matches("万").trim().parse::<Decimal>().map_err(|e| e.to_string())? * Decimal::from(10_000);

        let mut args_list = Vec::new();
        args_list.push(StockInfoArgs {
            id: None,
            asset_id: asset_id.to_string(),
            stock_code: code.to_string(),
            release_date,
            issue_price,
            issue_number,
            region,
            main_business,
            create_time: None,
            update_time: None,
        });

        StockInfo::batch_add(asset_id, args_list).await
    }

    // 插入股票行业关系
    pub async fn insert_stock_industry(asset_id: &str, basic_info: &Value) -> Result<bool, String> {
        let industry = JsonUtils::get_array_by_key(basic_info, "industry");

        let mut industry_args_list = Vec::new();
        let mut asset_industry_args_list = Vec::new();

        let time = handlers::utils::Utils::get_date(None);
        let source = "BAIDU";

        for item in industry {
            let url = JsonUtils::get_string(&item, "url");
            let text = JsonUtils::get_string(&item, "text");

            // 从 URL 中获取行业 code
            let code = Handler::get_query_param(&url, "code").unwrap_or_default();

            if code.is_empty() || text.is_empty() {
                continue;
            }

            let industry_id = Uuid::new_v4().to_string();
            industry_args_list.push(StockIndustryArgs {
                id: Some(industry_id.clone()),
                code,
                name: text,
                source: source.to_string(),
                create_time: Some(time.clone()),
                update_time: None,
            });

            asset_industry_args_list.push(AssetIndustryArgs {
                id: Some(Uuid::new_v4().to_string()),
                asset_id: asset_id.to_string(),
                industry_id,
                create_time: Some(time.clone()),
                update_time: None,
            });
        }

        StockIndustry::batch_add(&asset_id, &source, industry_args_list, asset_industry_args_list).await
    }

    /**
      获取 ETF 简况
      例: https://finance.pae.baidu.com/sapi/v1/basicinfo?market=ab&financeType=etf&code=588710&finClientType=pc
    */
    pub async fn get_etf_info() {}

    /**
      获取 Stock 简况
      例: https://finance.pae.baidu.com/api/stockwidget?code=300308&market=ab&type=stock&widgetType=company&finClientType=pc
    */
    pub async fn get_stock_info(args: &Args) -> Result<Value, String> {
        let url = format!(
            "{}/api/stockwidget?market={}&code={}&type={}&widgetType=company&finClientType=pc",
            BD_HTTP_URL_PREFIX,
            args.market,
            args.code,
            args.market_type.as_str()
        );
        Utils::get_response(&url).await
    }

    // 插入股票每日行情及盘口指标
    pub async fn insert_quote_data(asset_id: &str, result: &Value) -> Result<bool, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let pan_kou = JsonUtils::get_path(&result, &["pankouinfos"]).unwrap_or(&Value::Null);
        if pan_kou.is_null() {
            return Err(Error::Error(String::from("`pankouinfos` is empty!")).to_string());
        }

        let list = JsonUtils::get_array_by_key(pan_kou, "list");
        if list.is_empty() {
            return Err(Error::Error(String::from("`list` is empty!")).to_string());
        }

        let cur = JsonUtils::get_path(&result, &["cur"]).unwrap_or(&Value::Null);

        let mut args = StockQuoteDailyArgs {
            asset_id: asset_id.to_string(),
            trade_date: chrono::Local::now().date_naive(),
            ..Default::default()
        };

        if !cur.is_null() {
            args.price_change = cur.get("increase").and_then(|v| v.as_str()).and_then(|v| v.parse::<Decimal>().ok()).unwrap_or(Decimal::ZERO);
            args.price_change_ratio = cur.get("ratio").and_then(|v| v.as_str()).map(|v| v.trim_end_matches('%')).and_then(|v| v.parse::<Decimal>().ok()).unwrap_or(Decimal::ZERO);
        }

        for item in list {
            let ename = item.get("ename").and_then(|v| v.as_str()).unwrap_or("");
            let origin_value = item.get("originValue").and_then(|v| v.as_str()).unwrap_or("");

            // 没有 originValue，例如 priceSaleRatio = "--"
            if origin_value.is_empty() {
                continue;
            }

            match ename {
                "open" => {
                    args.open = Handler::parse_decimal(origin_value);
                }

                "high" => {
                    args.high = Handler::parse_decimal(origin_value);
                }

                "low" => {
                    args.low = Handler::parse_decimal(origin_value);
                }

                "preClose" => {
                    args.pre_close = Handler::parse_decimal(origin_value);
                }

                "avgPrice" => {
                    args.avg_price = Handler::parse_decimal(origin_value);
                }

                "limitUp" => {
                    args.limit_up = Handler::parse_decimal(origin_value);
                }

                "limitDown" => {
                    args.limit_down = Handler::parse_decimal(origin_value);
                }

                "priceLimit" => {
                    args.price_change_ratio = Handler::parse_decimal(origin_value);
                }

                "amplitudeRatio" => {
                    args.amplitude_ratio = Handler::parse_decimal(origin_value);
                }

                "volume" => {
                    args.volume = Handler::parse_i32(origin_value);
                }

                "amount" => {
                    args.amount = Handler::parse_decimal(origin_value);
                }

                "turnoverRatio" => {
                    args.turnover_ratio = Handler::parse_decimal(origin_value);
                }

                "volumeRatio" => {
                    args.volume_ratio = Handler::parse_decimal(origin_value);
                }

                "inside" => {
                    args.inside = Handler::parse_i32(origin_value);
                }

                "outside" => {
                    args.outside = Handler::parse_i32(origin_value);
                }

                "weibiRatio" => {
                    args.weibi_ratio = Handler::parse_decimal(origin_value);
                }

                "peratio" => {
                    args.pe_ttm = Handler::parse_decimal(origin_value);
                }

                "lyr" => {
                    args.pe_lyr = Handler::parse_decimal(origin_value);
                }

                "bvRatio" => {
                    args.pb = Handler::parse_decimal(origin_value);
                }

                "priceSaleRatio" => {
                    args.ps = Handler::parse_decimal(origin_value);
                }

                "capitalization" => {
                    args.market_cap = Handler::parse_decimal(origin_value);
                }

                "currencyValue" => {
                    args.circulating_market_cap = Handler::parse_decimal(origin_value);
                }

                "totalShareCapital" => {
                    args.total_share_capital = Handler::parse_i32(origin_value);
                }

                "circulatingCapital" => {
                    args.circulating_share_capital = Handler::parse_i32(origin_value);
                }

                "w52_high" => {
                    args.week52_high = Handler::parse_decimal(origin_value);
                }

                "w52_low" => {
                    args.week52_low = Handler::parse_decimal(origin_value);
                }

                // 这些字段后面放 stock_info
                "profit_flag" | "vote_right_flag" | "ptcc_flag" | "reg_flag" => {}

                _ => {
                    info!("{} unknown pankou indicator: {}", LOGGER_PREFIX, ename);
                }
            }
        }

        StockQuoteDaily::batch_add(vec![args]).await
    }

    // 解析实时数据
    pub fn analyze_real_time_data(result: &Value) -> Result<StockInfoResult, String> {
        if result.is_null() {
            return Err(Error::Error(String::from("analyze real time data error: `result` is empty!")).to_string());
        }

        // 1. 获取盘口信息
        let pan_kou_info = JsonUtils::get_path(&result, &["pankouinfos"]).unwrap_or(&Value::Null);
        let pan_kou = JsonUtils::get_array_by_key(&pan_kou_info, "list");

        // 1. 获取 `买`: askinfos
        let ask_list = JsonUtils::get_path(&result, &["askinfos"]).unwrap_or(&Value::Null);

        // 2. 获取 `卖`: buyinfos
        let buy_list = JsonUtils::get_path(&result, &["buyinfos"]).unwrap_or(&Value::Null);

        // 3. 获取 交易详情: detailinfos
        let detail_list = JsonUtils::get_path(&result, &["detailinfos"]).unwrap_or(&Value::Null);

        // 4. 获取 交易价格、涨跌幅、交易时间等
        let currency = JsonUtils::get_path(&result, &["cur"]).unwrap_or(&Value::Null);

        // 5. 获取分时图数据
        let market_data = JsonUtils::get_path(&result, &["newMarketData"]).unwrap_or(&Value::Null);

        // 6. 当前交易状态、时间、时区
        let update = JsonUtils::get_path(&result, &["update"]).unwrap_or(&Value::Null);

        Ok(StockInfoResult {
            pan_kou,
            ask_list: ask_list.clone(),
            buy_list: buy_list.clone(),
            detail_list: detail_list.clone(),
            market_data: market_data.clone(),
            currency: currency.clone(),
            update: update.clone(),
        })
    }

    pub async fn query_stock_info_value(asset_id: &str, args: &Args, real_info: Option<StockInfoResult>) -> Result<Value, String> {
        if asset_id.is_empty() {
            return Err(Error::Error(String::from("`asset_id` is empty!")).to_string());
        }

        let asset = StockIndustry::get_detail_by_id(asset_id).await?;
        let stock_info = StockInfo::get_by_asset_id(asset_id).await?;

        let real = if let Some(real_info) = real_info {
            real_info
        } else {
            // 获取请求
            let result = Self::query(args).await?;
            if JsonUtils::is_empty(&result) {
                StockInfoResult::default()
            } else {
                Self::analyze_real_time_data(&result)?
            }
        };

        let result = json!({
            "basicInfo": asset,
            "stockInfo": stock_info,
            "realInfo": real,
        });

        Ok(result)
    }

    pub async fn query_stock_info(asset_id: &str, args: &Args, real_info: Option<StockInfoResult>) -> Result<HttpResponse, String> {
        let result = Self::query_stock_info_value(asset_id, args, real_info).await?;
        Ok(get_success_response(Some(result)))
    }

    // 插入资产信息
    pub async fn insert_asset_data(args: &Args, result: &Value) -> Result<String, String> {
        if result.is_null() {
            return Err(Error::Error(String::from("insert stock asset error: `result` is empty!")).to_string());
        }

        // 1. 信息: 从 basicinfos 中取
        let basic_info = JsonUtils::get_path(&result, &["basicinfos"]).unwrap_or(&Value::Null);
        if JsonUtils::is_empty(basic_info) {
            return Err(Error::Error(String::from("`basicinfos` is empty!")).to_string());
        }

        // 2. 披露信息: 取 financeReport 下的 text
        let finance_report = JsonUtils::get_path(&result, &["financeReport"]).unwrap_or(&Value::Null);

        // 3. 标签: 从 tag_list 中取
        let tag_list = JsonUtils::get_path(&result, &["tag_list"]).and_then(|v| v.as_array()).cloned().unwrap_or_default();

        let time = handlers::utils::Utils::get_date(None);
        let exchange = match args.exchange.as_deref() {
            Some(exchange) if !exchange.is_empty() => exchange.to_string(),
            _ => JsonUtils::get_string(basic_info, "exchange"),
        };

        // 1. 插入资产
        let asset_args = AssetArgs {
            id: None,
            code: args.code.to_string(),
            name: JsonUtils::get_string(basic_info, "name"),
            asset_type: args.market_type.as_str().to_string(),
            market: args.market.to_string(),
            exchange: exchange.to_string(),
            disclosure: Some(JsonUtils::get_string(finance_report, "text")),
            logo: Some(JsonUtils::get_string(basic_info, "logo")),
            create_time: Some(time.clone()),
            update_time: None,
        };

        // 2. 插入标签
        let mut asset_tag_args_list = Vec::new();

        if !tag_list.is_empty() {
            for tag in tag_list {
                asset_tag_args_list.push(AssetTagArgs {
                    id: None,
                    name: JsonUtils::get_string(&tag, "desc"),
                    tag_type: "".to_string(),
                    img: JsonUtils::get_string(&tag, "imageUrl"),
                    create_time: Some(time.clone()),
                    update_time: None,
                });
            }
        }

        Asset::insert(asset_args, asset_tag_args_list).await
    }

    /*
     查询分时(5s一次)
    */
    pub async fn query_time_division(args: &Args) -> Result<HttpResponse, String> {
        Self::query_info(args).await
    }

    /*
     五日/日K/周K/月K/季K/年K等
    */
    pub async fn query_kline_data(args: &Args) -> Result<HttpResponse, String> {
        let query_type = args.query_type;
        let k_line_type = args.k_line_type;
        let period = k_line_type.period().unwrap_or_default();

        // 查询资产信息
        let asset = Asset::get_by_code_type(&args.code, args.market_type.as_str()).await?;
        let asset_id = match asset {
            None => String::new(),
            Some(asset) => asset.id.unwrap_or_default(),
        };

        if asset_id.is_empty() {
            return Err(Error::Error(String::from("query kline data: `asset` not found!")).to_string());
        }

        // 解析实时数据
        let asset = StockIndustry::get_detail_by_id(&asset_id).await?;
        let stock_info = StockInfo::get_by_asset_id(&asset_id).await?;

        // 通过接口查询
        let result = Self::query(args).await?;
        let market_data = JsonUtils::get_path(&result, &["newMarketData"]).unwrap_or(&Value::Null);

        // 五日直接取 newMarketData -> marketData(数组, 需要解析数据中的 p)
        if query_type == QueryType::FiveDay {
            let data = JsonUtils::get_array_by_key(market_data, "marketData");
            let x_labels = JsonUtils::get_array_by_key(market_data, "cx");

            let mut list = Vec::new();
            for item in data {
                let p = JsonUtils::get_string(&item, "p");
                if !p.is_empty() {
                    let args_list = Self::parse_five_day_data(&p);
                    list.extend(args_list);
                }
            }

            return Ok(get_success_response(Some(json!({
                    "basicInfo": asset,
                    "stockInfo": stock_info,
                    "kline": {
                       "xLabels": x_labels,
                       "list": list
                    },
            }))));
        }

        // 其他的取 newMarketData -> marketData(字符串)
        let data = JsonUtils::get_string(market_data, "marketData");
        if !data.is_empty() {
            let list = Self::parse_kline_data(&asset_id, period, &data);
            let _ = Kline::batch_add(list.clone()).await?;

            // 查询数据
            return Ok(get_success_response(Some(json!({
                    "basicInfo": asset,
                    "stockInfo": stock_info,
                   "kline": {
                       "xLabels": [],
                       "list": list
                    },
            }))));
        }

        Ok(get_success_response(Some(json!({
                "basicInfo": asset,
                "stockInfo": stock_info,
                "kline": {
                 "xLabels": [],
                 "list": []
            },
        }))))
    }

    // 解析五日数据
    pub fn parse_five_day_data(data: &str) -> Vec<FiveDayKlineArgs> {
        let mut list = Vec::new();

        for row in data.split(';') {
            if row.trim().is_empty() {
                continue;
            }

            let values: Vec<&str> = row.split(',').collect();

            if values.len() < 10 {
                continue;
            }

            let timestamp = match values[0].parse::<i32>() {
                Ok(value) => value,
                Err(_) => continue,
            };

            let parse_decimal = |value: &str| -> Decimal { value.trim().trim_start_matches('+').parse::<Decimal>().unwrap_or(Decimal::ZERO) };

            list.push(FiveDayKlineArgs {
                timestamp,
                time: values[1].to_string(),
                price: parse_decimal(values[2]),
                avg_price: parse_decimal(values[3]),
                range: parse_decimal(values[4]),
                ratio: parse_decimal(values[5]),
                volume: parse_decimal(values[6]),
                amount: parse_decimal(values[7]),
            });
        }

        list
    }

    // 解析数据
    pub fn parse_kline_data(asset_id: &str, period: &str, market_data: &str) -> Vec<KlineArgs> {
        let mut list = Vec::new();

        for row in market_data.split(';') {
            if row.trim().is_empty() {
                continue;
            }

            let values: Vec<&str> = row.split(',').collect();

            if values.len() < 18 {
                continue;
            }

            let parse_decimal = |value: &str| -> Decimal {
                if value == "--" || value.is_empty() {
                    Decimal::ZERO
                } else {
                    value.parse::<Decimal>().unwrap_or(Decimal::ZERO)
                }
            };

            let trade_date = match NaiveDate::parse_from_str(values[1], "%Y-%m-%d") {
                Ok(date) => date,
                Err(_) => continue,
            };

            let timestamp = match values[0].parse::<i32>() {
                Ok(timestamp) => timestamp,
                Err(_) => continue,
            };

            list.push(KlineArgs {
                id: Some(Uuid::new_v4().to_string()),
                asset_id: asset_id.to_string(),
                period: period.to_string(),
                trade_date,
                timestamp,
                open: parse_decimal(values[2]),
                close: parse_decimal(values[3]),
                volume: parse_decimal(values[4]),
                high: parse_decimal(values[5]),
                low: parse_decimal(values[6]),
                amount: parse_decimal(values[7]),
                range: parse_decimal(values[8]),
                ratio: parse_decimal(values[9]),
                turnover_ratio: parse_decimal(values[10]),
                pre_close: parse_decimal(values[11]),
                ma5_avg_price: parse_decimal(values[12]),
                ma5_volume: parse_decimal(values[13]),
                ma10_avg_price: parse_decimal(values[14]),
                ma10_volume: parse_decimal(values[15]),
                ma20_avg_price: parse_decimal(values[16]),
                ma20_volume: parse_decimal(values[17]),
                create_time: None,
                update_time: None,
            });
        }

        list
    }
}
