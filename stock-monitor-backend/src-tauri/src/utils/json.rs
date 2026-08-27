/*!
  解析 serde json 字段
*/

use serde_json::Value;

pub struct JsonUtils;

impl JsonUtils {
    /// 判断 Value 是否为空
    pub fn is_empty(value: &Value) -> bool {
        match value {
            Value::Null => true,
            Value::Object(map) => map.is_empty(),
            Value::Array(arr) => arr.is_empty(),
            Value::String(s) => s.is_empty(),
            _ => false,
        }
    }

    // 获取对象字段
    pub fn get<'a>(value: &'a Value, key: &str) -> Option<&'a Value> {
        value.get(key)
    }

    /// 获取字符串
    pub fn get_string(value: &Value, key: &str) -> String {
        value.get(key).and_then(|v| v.as_str()).unwrap_or("").to_string()
    }

    /// 获取数字 f64
    pub fn get_f64(value: &Value, key: &str) -> f64 {
        value.get(key).and_then(|v| v.as_f64()).unwrap_or(0.0)
    }

    /// 获取整数
    pub fn get_i64(value: &Value, key: &str) -> i64 {
        value.get(key).and_then(|v| v.as_i64()).unwrap_or(0)
    }

    /// 获取 bool
    pub fn get_bool(value: &Value, key: &str) -> bool {
        value.get(key).and_then(|v| v.as_bool()).unwrap_or(false)
    }

    /// 根据 Key 获取数组
    pub fn get_array_by_key(value: &Value, key: &str) -> Vec<Value> {
        value.get(key).and_then(|v| v.as_array()).cloned().unwrap_or_default()
    }

    /// 获取数组
    pub fn get_array(value: &Value) -> Vec<Value> {
        value.as_array().cloned().unwrap_or_default()
    }

    /// 根据索引获取数组
    pub fn get_array_index(value: &Value, index: usize) -> Value {
        value.as_array().and_then(|arr| arr.get(index)).cloned().unwrap_or(Value::Null)
    }

    /// 获取嵌套对象
    /// 例如 tplData.result
    pub fn get_path<'a>(value: &'a Value, path: &[&str]) -> Option<&'a Value> {
        let mut current = value;
        for key in path {
            current = current.get(*key)?;
        }

        Some(current)
    }

    // 通过 field 查找数组对象
    pub fn get_array_object_by_field(list: &Vec<Value>, key: &str, value: &str) -> Option<Value> {
        for item in list {
            if let Some(obj) = item.as_object() {
                if obj.get(key).and_then(|v| v.as_str()).unwrap_or("") == value {
                    return Some(item.clone());
                }
            }
        }

        None
    }
}
