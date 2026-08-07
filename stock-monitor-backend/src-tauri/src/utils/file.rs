//! 文件助手

pub struct FileUtils;

impl FileUtils {
    /// 格式化 permissions
    pub fn format_permissions(mode: u32) -> String {
        let user = Self::format_mode_part((mode >> 6) & 0o7);
        let group = Self::format_mode_part((mode >> 3) & 0o7);
        let others = Self::format_mode_part(mode & 0o7);
        format!("{}{}{}", user, group, others)
    }

    /// 格式化 mode
    pub fn format_mode_part(part: u32) -> String {
        let r = if (part & 0o4) == 0 { "-" } else { "r" };
        let w = if (part & 0o2) == 0 { "-" } else { "w" };
        let x = if (part & 0o1) == 0 { "-" } else { "x" };
        format!("{}{}{}", r, w, x)
    }

    /// 转换文件大小
    pub fn convert_size(size: u64) -> String {
        if size >= 1024 * 1024 * 1024 {
            format!("{:.2} GB", size as f64 / (1024.0 * 1024.0 * 1024.0))
        } else if size >= 1024 * 1024 {
            format!("{:.2} MB", size as f64 / (1024.0 * 1024.0))
        } else if size >= 1024 {
            format!("{:.2} KB", size as f64 / 1024.0)
        } else {
            format!("{} bytes", size)
        }
    }

    /// 获取文件后缀
    pub fn get_file_suffix(file_name: &str) -> String {
        let names: Vec<&str> = file_name.split(".").collect();
        let mut file_suffix = String::new();
        if let Some(suffix) = names.last() {
            file_suffix = suffix.to_lowercase().to_string()
        }

        return file_suffix;
    }
}
