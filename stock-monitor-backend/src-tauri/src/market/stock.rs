/*!
   股票/etf信息
*/

use crate::asset::asset::{Asset, AssetArgs};
use crate::asset::tag::AssetTagArgs;
use crate::error::Error;
use crate::market::Args;
use crate::prepare::{get_success_response, HttpResponse};
use crate::utils::json::JsonUtils;
use crate::utils::Utils;
use crate::BD_HTTP_URL_PREFIX;
use serde_json::Value;

pub struct Stock {}

impl Stock {
    /*
      查询股票信息
      例: https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_minute_ab&query=588710&code=588710&market_type=ab&newFormat=1&name=%E5%8D%8E%E6%B3%B0%E6%9F%8F%E7%91%9E%E4%B8%8A%E8%AF%81%E7%A7%91%E5%88%9B%E6%9D%BF%E5%8D%8A%E5%AF%BC%E4%BD%93%E6%9D%90%E6%96%99%E8%AE%BE%E5%A4%87%E4%B8%BB%E9%A2%98ETF&is_kc=1&finClientType=pc&financeType=etf&finClientType=pc
    */
    pub async fn query(args: &Args) -> Result<Value, String> {
        if args.code.is_empty() {
            return Err(Error::Error(String::from("`code` is empty!")).to_string());
        }

        if args.market.is_empty() {
            return Err(Error::Error(String::from("`market` is empty!")).to_string());
        }

        let query_type = args.query_type.as_deref().unwrap_or("");
        if query_type.is_empty() {
            return Err(Error::Error(String::from("`queryType` is empty!")).to_string());
        }

        let ktype = args.ktype.as_deref().unwrap_or("");
        let mut url = format!(
            "{}vapi/v1/getquotation?pointType=string&group=quotation_{}_{}&query={}&code={}&market_type={}&newFormat=1&is_kc=1&finClientType=pc&financeType={}&finClientType=pc",
            BD_HTTP_URL_PREFIX,
            query_type,
            args.market,
            args.code,
            args.code,
            args.market,
            args._type.as_str(),
        );

        if query_type == "kline" {
            url = format!("{}&ktype={}", url, ktype);
        }

        Utils::get_response(&url).await
    }

    /*
     获取股票的信息, 包括名称、头像、标签、信息披露
    */
    pub async fn query_info(args: &Args) -> Result<HttpResponse, String> {
        let response = Self::query(args).await;

        match response {
            Ok(data) => {
                // 资产信息: 从 basicinfos 中取
                let basic_info = JsonUtils::get_path(&data, &["basicinfos"]).unwrap_or(&Value::Null);
                if JsonUtils::is_empty(basic_info) {
                    return Ok(get_success_response(Some(data)));
                }

                // 披露信息: 取 financeReport 下的 text
                let finance_report = JsonUtils::get_path(&data, &["financeReport"]).unwrap_or(&Value::Null);

                // 标签: 从 tag_list 中取
                let tag_list = JsonUtils::get_path(&data, &["tag_list"]).and_then(|v| v.as_array()).cloned().unwrap_or_default();

                let _ = Self::insert_asset_data(args, basic_info, finance_report, tag_list);
                Ok(get_success_response(Some(data)))
            }
            Err(err) => Ok(crate::prepare::get_error_response(&err)),
        }
    }

    /*
        获取分时图数据
    */
    pub async fn get_time_data(args: &Args) -> Result<HttpResponse, String> {
        let response = Self::query(args).await;
        Utils::parepare_response(response)
    }

    // 插入资产信息
    pub async fn insert_asset_data(args: &Args, basic_info: &Value, finance_report: &Value, tag_list: Vec<Value>) -> Result<String, String> {
        let time = handlers::utils::Utils::get_date(None);
        let exchange = args.exchange.as_deref().unwrap_or("");

        // 1. 资产
        let asset_args = AssetArgs {
            id: None,
            code: args.code.to_string(),
            name: JsonUtils::get_string(basic_info, "name"),
            asset_type: args._type.as_str().to_string(),
            market: args.market.to_string(),
            exchange: exchange.to_string(),
            disclosure: Some(JsonUtils::get_string(finance_report, "text")),
            logo: Some(JsonUtils::get_string(basic_info, "logo")),
            create_time: Some(time.clone()),
            update_time: None,
        };

        // 2. 标签
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
}
