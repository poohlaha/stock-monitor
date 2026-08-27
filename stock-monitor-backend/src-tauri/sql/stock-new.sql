/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80039 (8.0.39)
 Source Host           : localhost:3306
 Source Schema         : stock

 Target Server Type    : MySQL
 Target Server Version : 80039 (8.0.39)
 File Encoding         : 65001

 Date: 25/08/2026 18:03:49
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for asset
-- ----------------------------
DROP TABLE IF EXISTS `asset`;
CREATE TABLE `asset` (
  `id` varchar(255) NOT NULL COMMENT '资产ID',
  `code` varchar(20) NOT NULL COMMENT '资产代码',
  `name` varchar(100) NOT NULL COMMENT '资产名称',
  `asset_type` varchar(20) NOT NULL COMMENT '资产类型(FUND/STOCK/ETF)',
  `market` varchar(50) DEFAULT NULL COMMENT '所属市场',
  `exchange` varchar(20) DEFAULT NULL COMMENT '交易所',
  `logo` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'LOGO',
  `disclosure` text COMMENT '信息披露',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code_type` (`code`,`asset_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='资产基础信息表，存储基金、股票、ETF等金融资产公共信息';

-- ----------------------------
-- Table structure for asset_sync_record
-- ----------------------------
DROP TABLE IF EXISTS `asset_sync_record`;
CREATE TABLE `asset_sync_record` (
  `id` varchar(36) NOT NULL COMMENT 'ID',
  `asset_id` varchar(36) NOT NULL COMMENT '资产ID',
  `sync_type` varchar(50) NOT NULL COMMENT '同步类型',
  `sync_time` datetime NOT NULL COMMENT '最后同步时间',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_sync_type` (`asset_id`,`sync_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='资产数据同步记录表';

-- ----------------------------
-- Table structure for asset_tag
-- ----------------------------
DROP TABLE IF EXISTS `asset_tag`;
CREATE TABLE `asset_tag` (
  `id` varchar(255) NOT NULL COMMENT '标签ID',
  `name` varchar(50) NOT NULL COMMENT '标签名称',
  `tag_type` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '标签类型',
  `img` varchar(255) DEFAULT NULL COMMENT '标签图标',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='资产标签信息表，用于描述资产分类和主题属性';

-- ----------------------------
-- Table structure for asset_tag_relation
-- ----------------------------
DROP TABLE IF EXISTS `asset_tag_relation`;
CREATE TABLE `asset_tag_relation` (
  `id` varchar(255) NOT NULL,
  `asset_id` varchar(255) NOT NULL COMMENT '资产ID',
  `tag_id` varchar(255) NOT NULL COMMENT '标签ID',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_tag` (`asset_id`,`tag_id`),
  KEY `idx_asset` (`asset_id`),
  KEY `idx_tag` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='资产标签关联表，维护资产与标签之间的多对多关系';

-- ----------------------------
-- Table structure for fund_asset_allocation
-- ----------------------------
DROP TABLE IF EXISTS `fund_asset_allocation`;
CREATE TABLE `fund_asset_allocation` (
  `id` varchar(36) NOT NULL COMMENT 'ID',
  `asset_id` varchar(36) NOT NULL COMMENT '基金资产ID',
  `asset_type` varchar(50) NOT NULL COMMENT '资产类型 stock/bond/cash',
  `proportion` decimal(10,4) DEFAULT NULL COMMENT '占比',
  `report_date` varchar(20) DEFAULT NULL COMMENT '报告日期',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_type_date` (`asset_id`,`asset_type`,`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金资产配置历史表，记录基金股票、债券、现金等大类资产配置比例';

-- ----------------------------
-- Table structure for fund_factor
-- ----------------------------
DROP TABLE IF EXISTS `fund_factor`;
CREATE TABLE `fund_factor` (
  `id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'ID',
  `asset_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '资产ID',
  `period` varchar(50) NOT NULL COMMENT '周期',
  `factor_type` varchar(50) NOT NULL COMMENT '因子类型',
  `factor_name` varchar(100) DEFAULT NULL COMMENT '展示名称',
  `factor_value` decimal(10,4) DEFAULT NULL COMMENT '因子值',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_period_factor` (`asset_id`,`period`,`factor_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金量化因子指标表，记录波动率、最大回撤、夏普比率等风险收益指标';

-- ----------------------------
-- Table structure for fund_holding
-- ----------------------------
DROP TABLE IF EXISTS `fund_holding`;
CREATE TABLE `fund_holding` (
  `id` varchar(36) NOT NULL,
  `asset_id` varchar(36) NOT NULL COMMENT '基金ID',
  `holding_type` varchar(50) DEFAULT NULL COMMENT 'stock/bond',
  `target_code` varchar(50) DEFAULT NULL COMMENT '股票债券代码',
  `target_name` varchar(255) DEFAULT NULL COMMENT '名称',
  `market` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '市场',
  `proportion` decimal(10,4) DEFAULT NULL COMMENT '持仓比例',
  `report_date` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '报告日期',
  `price_change` decimal(10,4) DEFAULT NULL COMMENT '持仓标的涨跌幅(%)',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_target_date` (`asset_id`,`target_code`,`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金持仓明细表，记录基金股票、债券等具体投资标的信息及占比';

-- ----------------------------
-- Table structure for fund_info
-- ----------------------------
DROP TABLE IF EXISTS `fund_info`;
CREATE TABLE `fund_info` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `asset_id` varchar(255) NOT NULL COMMENT '资产ID',
  `fund_company` varchar(255) DEFAULT NULL COMMENT '基金公司',
  `custodian` varchar(255) DEFAULT NULL COMMENT '基金托管人',
  `benchmark` text COMMENT '业绩基准',
  `establish_date` varchar(50) DEFAULT NULL COMMENT '成立日期',
  `investment_target` text COMMENT '投资目标',
  `investment_strategy` text COMMENT '投资策略',
  `fund_full_name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '基金全称',
  `fund_type` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '基金类型(股票型/混合型/债券型/QDII等)',
  `fund_scale` decimal(10,4) DEFAULT NULL COMMENT '最新规模(亿元)',
  `fund_code` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '基金代码',
  `fund_scale_text` varchar(255) DEFAULT NULL COMMENT '最新规模(亿元)(文字)',
  `latest_nav` decimal(10,4) DEFAULT NULL COMMENT '最新单位净值',
  `latest_nav_date` varchar(255) DEFAULT NULL COMMENT '最新净值日期',
  `latest_change` decimal(10,4) DEFAULT NULL COMMENT '最新日涨幅(%)',
  `create_time` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `update_time` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset` (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金扩展信息表，记录基金公司、托管人、投资目标、投资策略等基础信息';

-- ----------------------------
-- Table structure for fund_manager
-- ----------------------------
DROP TABLE IF EXISTS `fund_manager`;
CREATE TABLE `fund_manager` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `manager_code` varchar(50) NOT NULL COMMENT '第三方基金经理ID',
  `name` varchar(255) DEFAULT NULL COMMENT '基金经理名称',
  `avatar` varchar(500) DEFAULT NULL COMMENT '基金经理头像',
  `company` varchar(255) DEFAULT NULL COMMENT '所属基金公司',
  `description` text COMMENT '基金经理简介',
  `resume` text COMMENT '基金经理详细履历',
  `working_years` decimal(10,2) DEFAULT NULL COMMENT '证券从业年限(年)',
  `manage_scale` decimal(10,4) DEFAULT NULL COMMENT '当前管理基金规模(亿元)',
  `earning_rate` decimal(10,4) DEFAULT NULL COMMENT '任期累计收益率(%)',
  `average_return` decimal(10,4) DEFAULT NULL COMMENT '平均年化收益率(%)',
  `max_drawdown` decimal(10,4) DEFAULT NULL COMMENT '最大回撤(%)',
  `top_report` decimal(10,4) DEFAULT NULL COMMENT '任期最高收益率(%)',
  `create_time` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `update_time` varchar(255) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_manager_code` (`manager_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金经理信息表，记录基金经理基本资料、从业经历及历史业绩指标';

-- ----------------------------
-- Table structure for fund_manager_relation
-- ----------------------------
DROP TABLE IF EXISTS `fund_manager_relation`;
CREATE TABLE `fund_manager_relation` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `manager_id` varchar(255) NOT NULL COMMENT '基金经理ID',
  `asset_id` varchar(255) DEFAULT NULL COMMENT '基金资产ID',
  `fund_code` varchar(50) NOT NULL COMMENT '基金代码',
  `fund_name` varchar(255) DEFAULT NULL COMMENT '基金名称',
  `fund_type` varchar(255) DEFAULT NULL COMMENT '基金类型',
  `manage_type` tinyint NOT NULL COMMENT '管理类型: 1-在管基金 2-离任基金',
  `start_date` varchar(50) DEFAULT NULL COMMENT '开始管理日期',
  `end_date` varchar(50) DEFAULT NULL COMMENT '结束管理日期',
  `manage_period` varchar(100) DEFAULT NULL COMMENT '管理期间,例如:25.10.31--至今',
  `period_return` decimal(10,4) NOT NULL DEFAULT '0.0000' COMMENT '任职期间收益率(%)',
  `period_rank` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '任职期间同类排名',
  `manage_days` int DEFAULT NULL COMMENT '管理天数',
  `period_years` decimal(10,4) NOT NULL DEFAULT '0.0000' COMMENT '任职年限',
  `earning_rate` decimal(10,4) NOT NULL DEFAULT '0.0000' COMMENT '任期回报',
  `yearly_return` decimal(10,4) NOT NULL DEFAULT '0.0000' COMMENT '年化回报',
  `report_date` varchar(255) DEFAULT NULL COMMENT '报告日期',
  `create_time` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `update_time` varchar(255) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_asset_manager_type_start` (`asset_id`,`manager_id`,`manage_type`,`start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金经理关系表，记录基金经理管理基金的历史关系，包括在管和离任基金';

-- ----------------------------
-- Table structure for fund_nav_curve
-- ----------------------------
DROP TABLE IF EXISTS `fund_nav_curve`;
CREATE TABLE `fund_nav_curve` (
  `id` varchar(32) NOT NULL COMMENT 'ID',
  `asset_id` varchar(32) NOT NULL COMMENT '资产ID',
  `report_date` date NOT NULL COMMENT '净值日期',
  `unit_nav` decimal(10,4) NOT NULL COMMENT '单位净值',
  `day_change` decimal(8,4) DEFAULT NULL COMMENT '日涨幅(%)',
  `accumulated_nav` decimal(10,4) DEFAULT NULL COMMENT '累计净值',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_date` (`asset_id`,`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金历史净值曲线表，记录基金每日单位净值及累计净值变化';

-- ----------------------------
-- Table structure for fund_performance_curve
-- ----------------------------
DROP TABLE IF EXISTS `fund_performance_curve`;
CREATE TABLE `fund_performance_curve` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `asset_id` varchar(255) NOT NULL COMMENT '资产ID',
  `series_type` varchar(50) NOT NULL COMMENT '曲线类型: fund(本基金), average(同类平均), index(指数)',
  `report_date` date NOT NULL COMMENT '日期',
  `value` decimal(10,4) NOT NULL COMMENT '累计收益率(%)',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_series_date` (`asset_id`,`series_type`,`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金收益走势曲线表，用于展示基金与同类基金及指数收益走势比较';

-- ----------------------------
-- Table structure for fund_price_change
-- ----------------------------
DROP TABLE IF EXISTS `fund_price_change`;
CREATE TABLE `fund_price_change` (
  `id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT 'ID',
  `asset_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL COMMENT '资产ID',
  `name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '名称',
  `price_change` decimal(10,4) DEFAULT NULL COMMENT '涨跌幅',
  `period` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT '周期',
  `create_time` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `update_time` varchar(255) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_period` (`asset_id`,`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金阶段收益表，记录基金不同周期的涨跌幅表现';

-- ----------------------------
-- Table structure for fund_rate
-- ----------------------------
DROP TABLE IF EXISTS `fund_rate`;
CREATE TABLE `fund_rate` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `asset_id` varchar(255) NOT NULL COMMENT '基金资产ID',
  `rate_type` varchar(50) NOT NULL COMMENT '费率类型: 认购费率/申购费率/赎回费率/运作费率',
  `rate_desc` text COMMENT '费率说明',
  `create_time` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `update_time` varchar(255) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_rate` (`asset_id`,`rate_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金费率分类表，记录基金申购、赎回、管理等费用类型';

-- ----------------------------
-- Table structure for fund_rate_detail
-- ----------------------------
DROP TABLE IF EXISTS `fund_rate_detail`;
CREATE TABLE `fund_rate_detail` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `rate_id` varchar(255) NOT NULL COMMENT '基金费率ID',
  `rate_measure` varchar(255) DEFAULT NULL COMMENT '费率条件',
  `unit_rate` decimal(10,4) DEFAULT NULL COMMENT '费率',
  `description` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `update_time` varchar(255) DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rate_measure` (`rate_id`,`rate_measure`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金费率明细表，记录不同条件下基金具体费率规则';

-- ----------------------------
-- Table structure for fund_scale_history
-- ----------------------------
DROP TABLE IF EXISTS `fund_scale_history`;
CREATE TABLE `fund_scale_history` (
  `id` varchar(36) NOT NULL,
  `asset_id` varchar(36) NOT NULL,
  `report_date` varchar(20) DEFAULT NULL COMMENT '报告日期',
  `scale` decimal(10,4) DEFAULT NULL COMMENT '基金规模(亿元)',
  `net_asset` decimal(10,4) DEFAULT NULL COMMENT '净资产规模(亿元)',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_date` (`asset_id`,`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金规模历史表，记录基金资产规模及净资产规模变化情况';

-- ----------------------------
-- Table structure for fund_stage_performance
-- ----------------------------
DROP TABLE IF EXISTS `fund_stage_performance`;
CREATE TABLE `fund_stage_performance` (
  `id` varchar(255) NOT NULL COMMENT 'ID',
  `asset_id` varchar(255) NOT NULL COMMENT '资产ID',
  `period` varchar(50) NOT NULL COMMENT '周期',
  `price_change` decimal(10,4) DEFAULT NULL COMMENT '基金涨幅',
  `average_change` decimal(10,4) DEFAULT NULL COMMENT '同类平均涨幅',
  `rank_num` int DEFAULT NULL COMMENT '同类排名',
  `rank_total` int DEFAULT NULL COMMENT '同类总数',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asset_period` (`asset_id`,`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金阶段业绩表现表，记录不同周期收益、同类平均及排名信息';

-- ----------------------------
-- Table structure for my_watch_group
-- ----------------------------
DROP TABLE IF EXISTS `my_watch_group`;
CREATE TABLE `my_watch_group` (
  `id` varchar(255) NOT NULL COMMENT '主键',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分组名称',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `is_default` tinyint(1) DEFAULT '0' COMMENT '是否默认分组',
  `create_time` varchar(255) DEFAULT NULL,
  `update_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户自选分组表，用于管理用户自选资产分类';

-- ----------------------------
-- Table structure for my_watch_group_relation
-- ----------------------------
DROP TABLE IF EXISTS `my_watch_group_relation`;
CREATE TABLE `my_watch_group_relation` (
  `id` varchar(255) NOT NULL,
  `watchlist_id` varchar(255) NOT NULL COMMENT '自选ID',
  `group_id` varchar(255) NOT NULL COMMENT '分组ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_watch_group` (`watchlist_id`,`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='用户自选分组关联表，维护自选资产与分组之间的关系';

-- ----------------------------
-- Table structure for my_watchlist
-- ----------------------------
DROP TABLE IF EXISTS `my_watchlist`;
CREATE TABLE `my_watchlist` (
  `id` varchar(255) NOT NULL COMMENT '主键',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '基金代码',
  `alias_name` varchar(100) DEFAULT NULL COMMENT '自定义名称',
  `is_pinned` tinyint(1) DEFAULT '0' COMMENT '是否置顶',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `exchange` varchar(255) DEFAULT NULL,
  `market` varchar(255) DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `create_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `update_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_fund` (`user_id`,`code`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户自选资产表，记录用户关注的基金、股票等资产关系';

SET FOREIGN_KEY_CHECKS = 1;
