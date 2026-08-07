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

 Date: 30/06/2026 13:48:48
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for fund_acc_nav
-- ----------------------------
DROP TABLE IF EXISTS `fund_acc_nav`;
CREATE TABLE `fund_acc_nav` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码（关联 fund_basic）',
  `nav_date` date NOT NULL COMMENT '净值日期（交易日）',
  `acc_nav` decimal(10,6) NOT NULL COMMENT '累计净值（复权后净值）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`nav_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_nav_date` (`nav_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金累计净值走势表（复权净值曲线，用于长期收益展示）';

-- ----------------------------
-- Records of fund_acc_nav
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_backtest_result
-- ----------------------------
DROP TABLE IF EXISTS `fund_backtest_result`;
CREATE TABLE `fund_backtest_result` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `strategy_id` varchar(30) NOT NULL COMMENT '策略ID（对应signal/portfolio版本）',
  `portfolio_id` varchar(20) DEFAULT NULL COMMENT '组合ID（对应组合优化表）',
  `signal_version` varchar(20) DEFAULT NULL COMMENT '信号版本号',
  `backtest_start` date NOT NULL COMMENT '回测开始日期',
  `backtest_end` date NOT NULL COMMENT '回测结束日期',
  `benchmark` varchar(20) DEFAULT NULL COMMENT '对标基准（如沪深300）',
  `total_return` decimal(10,4) DEFAULT NULL COMMENT '累计收益率',
  `annual_return` decimal(10,4) DEFAULT NULL COMMENT '年化收益率',
  `max_drawdown` decimal(10,4) DEFAULT NULL COMMENT '最大回撤',
  `volatility` decimal(10,4) DEFAULT NULL COMMENT '波动率',
  `sharpe_ratio` decimal(10,4) DEFAULT NULL COMMENT '夏普比率',
  `calmar_ratio` decimal(10,4) DEFAULT NULL COMMENT '卡玛比率',
  `win_rate` decimal(10,4) DEFAULT NULL COMMENT '胜率',
  `turnover_rate` decimal(10,4) DEFAULT NULL COMMENT '换手率',
  `alpha` decimal(10,4) DEFAULT NULL COMMENT '超额收益（Alpha）',
  `beta` decimal(10,4) DEFAULT NULL COMMENT '市场暴露（Beta）',
  `information_ratio` decimal(10,4) DEFAULT NULL COMMENT '信息比率',
  `consistency_score` decimal(10,4) DEFAULT NULL COMMENT '收益稳定性',
  `equity_curve` json DEFAULT NULL COMMENT '净值曲线（时间序列）',
  `benchmark_curve` json DEFAULT NULL COMMENT '基准曲线',
  `drawdown_curve` json DEFAULT NULL COMMENT '回撤曲线',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_strategy_period` (`strategy_id`,`backtest_start`,`backtest_end`),
  KEY `idx_strategy_id` (`strategy_id`),
  KEY `idx_portfolio_id` (`portfolio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金策略回测结果表（策略验证与评估层）';

-- ----------------------------
-- Records of fund_backtest_result
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_basic
-- ----------------------------
DROP TABLE IF EXISTS `fund_basic`;
CREATE TABLE `fund_basic` (
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码（唯一标识，如 024481）',
  `fund_name` varchar(100) DEFAULT NULL COMMENT '基金名称（如：财通品质甄选混合C）',
  `is_hb` tinyint(1) DEFAULT NULL COMMENT '是否货币基金标识：0=非货币基金，1=货币基金',
  `source_rate` decimal(5,2) DEFAULT NULL COMMENT '原始申购费率（单位：%）',
  `current_rate` decimal(5,2) DEFAULT NULL COMMENT '当前实际申购费率（折扣后，单位：%）',
  `min_purchase` decimal(10,2) DEFAULT NULL COMMENT '最低申购金额（单位：元）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间（入库时间）',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间（数据刷新时间）',
  PRIMARY KEY (`fund_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金基础信息表（存储基金静态属性，如名称、费率、申购门槛等）';

-- ----------------------------
-- Records of fund_basic
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_bond_holdings
-- ----------------------------
DROP TABLE IF EXISTS `fund_bond_holdings`;
CREATE TABLE `fund_bond_holdings` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `bond_code` varchar(20) NOT NULL COMMENT '债券代码',
  `bond_name` varchar(100) DEFAULT NULL COMMENT '债券名称',
  `report_date` date NOT NULL COMMENT '报告期（如 2025-12-31）',
  `position_ratio` decimal(10,4) DEFAULT NULL COMMENT '持仓占净值比例（%）',
  `market_value` decimal(18,4) DEFAULT NULL COMMENT '市值（单位取决于数据源）',
  `bond_type` varchar(20) DEFAULT NULL COMMENT '债券类型（国债/企业债/可转债等）',
  `maturity_date` date DEFAULT NULL COMMENT '到期日',
  `coupon_rate` decimal(10,4) DEFAULT NULL COMMENT '票面利率（%）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_bond_date` (`fund_code`,`bond_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_bond_code` (`bond_code`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金债券持仓明细表（季度级）';

-- ----------------------------
-- Records of fund_bond_holdings
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_cash_flow
-- ----------------------------
DROP TABLE IF EXISTS `fund_cash_flow`;
CREATE TABLE `fund_cash_flow` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `report_date` date NOT NULL COMMENT '报告期（如 2025-12-31）',
  `purchase_amount` decimal(18,4) DEFAULT NULL COMMENT '期间申购金额（亿元）',
  `redemption_amount` decimal(18,4) DEFAULT NULL COMMENT '期间赎回金额（亿元）',
  `net_flow` decimal(18,4) DEFAULT NULL COMMENT '净申购赎回（申购-赎回）',
  `total_share` decimal(18,4) DEFAULT NULL COMMENT '总份额（亿份）',
  `share_mom` decimal(10,4) DEFAULT NULL COMMENT '份额环比变化（%）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金申购赎回及份额变化表（资金流动行为）';

-- ----------------------------
-- Records of fund_cash_flow
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_factor_exposure
-- ----------------------------
DROP TABLE IF EXISTS `fund_factor_exposure`;
CREATE TABLE `fund_factor_exposure` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `report_date` date NOT NULL COMMENT '因子计算日期',
  `momentum` decimal(10,4) DEFAULT NULL COMMENT '动量因子暴露（趋势强度）',
  `value_factor` decimal(10,4) DEFAULT NULL COMMENT '价值因子暴露（低估/高估）',
  `growth_factor` decimal(10,4) DEFAULT NULL COMMENT '成长因子暴露',
  `size_factor` decimal(10,4) DEFAULT NULL COMMENT '市值因子暴露（大盘/小盘）',
  `quality_factor` decimal(10,4) DEFAULT NULL COMMENT '质量因子（盈利能力/ROE）',
  `volatility_factor` decimal(10,4) DEFAULT NULL COMMENT '波动因子暴露',
  `industry_concentration` decimal(10,4) DEFAULT NULL COMMENT '行业集中度因子',
  `style_score` decimal(10,4) DEFAULT NULL COMMENT '风格稳定性评分',
  `benchmark` varchar(20) DEFAULT NULL COMMENT '对标基准（如沪深300）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金因子暴露表（风格与驱动分析层）';

-- ----------------------------
-- Records of fund_factor_exposure
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_holdings_snapshot
-- ----------------------------
DROP TABLE IF EXISTS `fund_holdings_snapshot`;
CREATE TABLE `fund_holdings_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `report_date` date NOT NULL COMMENT '披露日期（季报/半年报/年报）',
  `stock_code` varchar(20) NOT NULL COMMENT '股票/债券代码',
  `stock_name` varchar(100) DEFAULT NULL COMMENT '证券名称',
  `asset_type` varchar(20) NOT NULL COMMENT '资产类型（stock/bond/cash/other）',
  `industry` varchar(50) DEFAULT NULL COMMENT '行业分类',
  `weight` decimal(10,6) DEFAULT NULL COMMENT '持仓占比（%）',
  `shares` decimal(20,4) DEFAULT NULL COMMENT '持股数量（如可得）',
  `market_value` decimal(20,4) DEFAULT NULL COMMENT '持仓市值（万元/亿元）',
  `change_flag` varchar(10) DEFAULT NULL COMMENT '变化标记（新进/增持/减持/清仓）',
  `change_ratio` decimal(10,4) DEFAULT NULL COMMENT '变动比例',
  `is_top10` tinyint(1) DEFAULT '0' COMMENT '是否前十大持仓',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date_stock` (`fund_code`,`report_date`,`stock_code`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_report_date` (`report_date`),
  KEY `idx_stock_code` (`stock_code`),
  KEY `idx_industry` (`industry`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金持仓快照表（股票/债券/资产结构核心来源）';

-- ----------------------------
-- Records of fund_holdings_snapshot
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_manager
-- ----------------------------
DROP TABLE IF EXISTS `fund_manager`;
CREATE TABLE `fund_manager` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码（关联 fund_basic）',
  `manager_id` varchar(20) NOT NULL COMMENT '基金经理ID（东方财富唯一ID）',
  `manager_name` varchar(50) DEFAULT NULL COMMENT '基金经理姓名',
  `star` tinyint DEFAULT NULL COMMENT '基金经理星级（1-5星）',
  `work_time` varchar(30) DEFAULT NULL COMMENT '从业时间（如：11年又222天）',
  `fund_size` varchar(50) DEFAULT NULL COMMENT '管理规模（如：89.09亿(13只基金)）',
  `join_date` date DEFAULT NULL COMMENT '任职开始时间（从profit/jzrq或历史推断）',
  `leave_date` date DEFAULT NULL COMMENT '离任时间（如有）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_manager_id` (`manager_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金经理信息表（包含当前及历史基金经理）';

-- ----------------------------
-- Records of fund_manager
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_nav
-- ----------------------------
DROP TABLE IF EXISTS `fund_nav`;
CREATE TABLE `fund_nav` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码（关联 fund_basic）',
  `nav_date` date NOT NULL COMMENT '净值日期（交易日）',
  `unit_nav` decimal(10,6) NOT NULL COMMENT '单位净值（如 1.8721）',
  `equity_return` decimal(10,6) DEFAULT NULL COMMENT '当日涨跌幅（百分比，如 0.0123 = 1.23%）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`nav_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_nav_date` (`nav_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金单位净值走势表（每日净值 + 涨跌幅）';

-- ----------------------------
-- Records of fund_nav
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_nav_history
-- ----------------------------
DROP TABLE IF EXISTS `fund_nav_history`;
CREATE TABLE `fund_nav_history` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `nav_date` date NOT NULL COMMENT '净值日期',
  `unit_nav` decimal(10,6) NOT NULL COMMENT '单位净值',
  `accum_nav` decimal(10,6) DEFAULT NULL COMMENT '累计净值',
  `daily_return` decimal(10,6) DEFAULT NULL COMMENT '当日涨跌幅（%）',
  `benchmark_return` decimal(10,6) DEFAULT NULL COMMENT '基准涨跌幅（如沪深300）',
  `volume` decimal(20,4) DEFAULT NULL COMMENT '成交量/规模（如有）',
  `asset_size` decimal(20,4) DEFAULT NULL COMMENT '基金规模（亿元）',
  `is_trading_day` tinyint(1) DEFAULT '1' COMMENT '是否交易日',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`nav_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_nav_date` (`nav_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金净值历史表（核心时间序列数据）';

-- ----------------------------
-- Records of fund_nav_history
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_portfolio_optimizer
-- ----------------------------
DROP TABLE IF EXISTS `fund_portfolio_optimizer`;
CREATE TABLE `fund_portfolio_optimizer` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `portfolio_id` varchar(20) NOT NULL COMMENT '组合ID（支持多策略组合）',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `weight` decimal(10,6) NOT NULL COMMENT '组合权重（0~1）',
  `signal_date` date NOT NULL COMMENT '调仓日期',
  `expected_return` decimal(10,4) DEFAULT NULL COMMENT '预期收益率',
  `expected_risk` decimal(10,4) DEFAULT NULL COMMENT '预期风险（波动率）',
  `sharpe_estimate` decimal(10,4) DEFAULT NULL COMMENT '预估夏普比率',
  `contribution_return` decimal(10,4) DEFAULT NULL COMMENT '收益贡献度',
  `contribution_risk` decimal(10,4) DEFAULT NULL COMMENT '风险贡献度',
  `turnover_rate` decimal(10,4) DEFAULT NULL COMMENT '换手率',
  `constraint_type` varchar(30) DEFAULT NULL COMMENT '约束条件（行业/风格/最大仓位等）',
  `model_version` varchar(20) DEFAULT NULL COMMENT '优化模型版本',
  `benchmark` varchar(20) DEFAULT NULL COMMENT '基准（如沪深300）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_portfolio_fund_date` (`portfolio_id`,`fund_code`,`signal_date`),
  KEY `idx_portfolio_id` (`portfolio_id`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_signal_date` (`signal_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金组合优化结果表（资产配置与权重分配层）';

-- ----------------------------
-- Records of fund_portfolio_optimizer
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_profile_snapshot
-- ----------------------------
DROP TABLE IF EXISTS `fund_profile_snapshot`;
CREATE TABLE `fund_profile_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `report_date` date NOT NULL COMMENT '数据报告期（如 2025-12-31）',
  `scale` decimal(18,4) DEFAULT NULL COMMENT '基金规模（亿元）',
  `scale_mom` decimal(10,4) DEFAULT NULL COMMENT '规模环比变化（%）',
  `holder_inst` decimal(10,4) DEFAULT NULL COMMENT '机构持有人比例（%）',
  `holder_individual` decimal(10,4) DEFAULT NULL COMMENT '个人持有人比例（%）',
  `holder_internal` decimal(10,4) DEFAULT NULL COMMENT '内部持有人比例（%）',
  `stock_ratio` decimal(10,4) DEFAULT NULL COMMENT '股票占比（%）',
  `bond_ratio` decimal(10,4) DEFAULT NULL COMMENT '债券占比（%）',
  `cash_ratio` decimal(10,4) DEFAULT NULL COMMENT '现金占比（%）',
  `nav_total` decimal(18,6) DEFAULT NULL COMMENT '基金净资产（亿元）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金规模、持有人结构、资产配置快照表';

-- ----------------------------
-- Records of fund_profile_snapshot
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_realtime_snapshot
-- ----------------------------
DROP TABLE IF EXISTS `fund_realtime_snapshot`;
CREATE TABLE `fund_realtime_snapshot` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `snapshot_time` datetime NOT NULL COMMENT '时间点（分钟级/秒级）',
  `estimated_nav` decimal(10,4) DEFAULT NULL COMMENT '估算净值',
  `actual_nav` decimal(10,4) DEFAULT NULL COMMENT '真实净值（收盘后）',
  `change_pct` decimal(10,4) DEFAULT NULL COMMENT '涨跌幅',
  `benchmark_change` decimal(10,4) DEFAULT NULL COMMENT '对标指数涨跌',
  `premium_discount` decimal(10,4) DEFAULT NULL COMMENT '溢价/折价',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_time` (`fund_code`,`snapshot_time`),
  KEY `idx_fund` (`fund_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金实时估值快照（盯盘核心）';

-- ----------------------------
-- Records of fund_realtime_snapshot
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_risk_metrics
-- ----------------------------
DROP TABLE IF EXISTS `fund_risk_metrics`;
CREATE TABLE `fund_risk_metrics` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `report_date` date NOT NULL COMMENT '统计日期或区间结束日期',
  `return_1m` decimal(10,4) DEFAULT NULL COMMENT '近1月收益率（%）',
  `return_3m` decimal(10,4) DEFAULT NULL COMMENT '近3月收益率（%）',
  `return_6m` decimal(10,4) DEFAULT NULL COMMENT '近6月收益率（%）',
  `return_1y` decimal(10,4) DEFAULT NULL COMMENT '近1年收益率（%）',
  `alpha` decimal(10,4) DEFAULT NULL COMMENT 'Alpha超额收益',
  `beta` decimal(10,4) DEFAULT NULL COMMENT 'Beta市场敏感度',
  `sharpe_ratio` decimal(10,4) DEFAULT NULL COMMENT '夏普比率',
  `sortino_ratio` decimal(10,4) DEFAULT NULL COMMENT '索提诺比率',
  `max_drawdown` decimal(10,4) DEFAULT NULL COMMENT '最大回撤（%）',
  `volatility` decimal(10,4) DEFAULT NULL COMMENT '波动率（标准差）',
  `tracking_error` decimal(10,4) DEFAULT NULL COMMENT '跟踪误差（对指数偏离）',
  `benchmark` varchar(20) DEFAULT NULL COMMENT '业绩比较基准（如沪深300）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金风险与绩效指标表（投研核心评价层）';

-- ----------------------------
-- Records of fund_risk_metrics
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_signal_event
-- ----------------------------
DROP TABLE IF EXISTS `fund_signal_event`;
CREATE TABLE `fund_signal_event` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `signal_type` varchar(50) NOT NULL COMMENT '信号类型',
  `signal_strength` decimal(10,4) DEFAULT NULL COMMENT '强度',
  `trigger_reason` text COMMENT '触发原因',
  `related_data` json DEFAULT NULL COMMENT '关联数据',
  `status` varchar(20) DEFAULT 'new' COMMENT '状态',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fund` (`fund_code`),
  KEY `idx_type` (`signal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='基金信号事件（策略输出层）';

-- ----------------------------
-- Records of fund_signal_event
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_stock_holdings
-- ----------------------------
DROP TABLE IF EXISTS `fund_stock_holdings`;
CREATE TABLE `fund_stock_holdings` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `stock_code` varchar(20) NOT NULL COMMENT '股票代码（A股/港股/美股统一编码）',
  `stock_name` varchar(50) DEFAULT NULL COMMENT '股票名称（可后补）',
  `market` varchar(10) DEFAULT NULL COMMENT '市场类型（SH/SZ/HK/US）',
  `report_date` date NOT NULL COMMENT '报告期（如 2025-12-31）',
  `position_ratio` decimal(10,4) DEFAULT NULL COMMENT '持仓占净值比例（%）',
  `shares` bigint DEFAULT NULL COMMENT '持股数量（如有）',
  `market_value` decimal(18,4) DEFAULT NULL COMMENT '市值（亿元或元，取决于源数据）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_stock_date` (`fund_code`,`stock_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_stock_code` (`stock_code`),
  KEY `idx_report_date` (`report_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金股票持仓明细表（季度级）';

-- ----------------------------
-- Records of fund_stock_holdings
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_strategy_signal
-- ----------------------------
DROP TABLE IF EXISTS `fund_strategy_signal`;
CREATE TABLE `fund_strategy_signal` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `signal_date` date NOT NULL COMMENT '信号生成日期',
  `signal_type` varchar(20) NOT NULL COMMENT '信号类型（BUY/SELL/ADD/HOLD/REDUCE）',
  `signal_strength` decimal(10,4) DEFAULT NULL COMMENT '信号强度（0~1或0~100）',
  `signal_source` varchar(50) DEFAULT NULL COMMENT '信号来源（因子/风格/资金流/风险/综合模型）',
  `momentum_score` decimal(10,4) DEFAULT NULL COMMENT '动量评分',
  `risk_score` decimal(10,4) DEFAULT NULL COMMENT '风险评分',
  `flow_score` decimal(10,4) DEFAULT NULL COMMENT '资金流评分',
  `style_score` decimal(10,4) DEFAULT NULL COMMENT '风格匹配评分',
  `composite_score` decimal(10,4) DEFAULT NULL COMMENT '综合评分（核心决策值）',
  `threshold_version` varchar(20) DEFAULT NULL COMMENT '策略版本号',
  `benchmark` varchar(20) DEFAULT NULL COMMENT '对标基准（如沪深300）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`signal_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_signal_date` (`signal_date`),
  KEY `idx_signal_type` (`signal_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金策略信号表（买卖与调仓决策层）';

-- ----------------------------
-- Records of fund_strategy_signal
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_style_rotation
-- ----------------------------
DROP TABLE IF EXISTS `fund_style_rotation`;
CREATE TABLE `fund_style_rotation` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `report_date` date NOT NULL COMMENT '计算日期',
  `style_label` varchar(20) DEFAULT NULL COMMENT '当前风格标签（成长/价值/均衡/赛道等）',
  `style_stability_score` decimal(10,4) DEFAULT NULL COMMENT '风格稳定性评分（越高越稳定）',
  `style_shift_score` decimal(10,4) DEFAULT NULL COMMENT '风格漂移程度（越高越频繁切换）',
  `market_regime` varchar(20) DEFAULT NULL COMMENT '市场状态（牛市/熊市/震荡）',
  `bull_capture` decimal(10,4) DEFAULT NULL COMMENT '牛市捕获能力（上涨市场收益能力）',
  `bear_protection` decimal(10,4) DEFAULT NULL COMMENT '熊市防御能力（回撤控制）',
  `volatility_adaptation` decimal(10,4) DEFAULT NULL COMMENT '波动适应能力',
  `timing_skill` decimal(10,4) DEFAULT NULL COMMENT '择时能力评分',
  `consistency_score` decimal(10,4) DEFAULT NULL COMMENT '长期一致性评分',
  `benchmark` varchar(20) DEFAULT NULL COMMENT '对标基准（如沪深300）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fund_date` (`fund_code`,`report_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_report_date` (`report_date`),
  KEY `idx_style` (`style_label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金风格漂移与市场适应性分析表';

-- ----------------------------
-- Records of fund_style_rotation
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for fund_total_return
-- ----------------------------
DROP TABLE IF EXISTS `fund_total_return`;
CREATE TABLE `fund_total_return` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `series_name` varchar(50) NOT NULL COMMENT '序列名称（基金/同类平均/沪深300等）',
  `nav_date` date NOT NULL COMMENT '日期',
  `return_rate` decimal(10,4) NOT NULL COMMENT '累计收益率（%）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_main` (`fund_code`,`series_name`,`nav_date`),
  KEY `idx_fund_code` (`fund_code`),
  KEY `idx_series` (`series_name`),
  KEY `idx_date` (`nav_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='基金累计收益对比表（基金 vs 同类 vs 基准）';

-- ----------------------------
-- Records of fund_total_return
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for my_fund_watch_config
-- ----------------------------
DROP TABLE IF EXISTS `my_fund_watch_config`;
CREATE TABLE `my_fund_watch_config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `alert_enabled` tinyint(1) DEFAULT '1' COMMENT '是否开启预警',
  `drop_alert_pct` decimal(5,2) DEFAULT NULL COMMENT '下跌预警阈值（%）',
  `rise_alert_pct` decimal(5,2) DEFAULT NULL COMMENT '上涨预警阈值（%）',
  `nav_high_alert` tinyint(1) DEFAULT '0' COMMENT '是否突破新高提醒',
  `nav_low_alert` tinyint(1) DEFAULT '0' COMMENT '是否跌破新低提醒',
  `flow_alert_enabled` tinyint(1) DEFAULT '0' COMMENT '是否资金流预警',
  `custom_strategy` json DEFAULT NULL COMMENT '自定义策略',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_fund` (`user_id`,`fund_code`),
  KEY `idx_fund` (`fund_code`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='我的基金盯盘配置表';

-- ----------------------------
-- Records of my_fund_watch_config
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for my_fund_watchlist
-- ----------------------------
DROP TABLE IF EXISTS `my_fund_watchlist`;
CREATE TABLE `my_fund_watchlist` (
  `id` varchar(255) NOT NULL COMMENT '主键',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `fund_name` varchar(255) DEFAULT NULL,
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `alias_name` varchar(100) DEFAULT NULL COMMENT '自定义名称',
  `group_name` varchar(50) DEFAULT NULL COMMENT '分组',
  `is_pinned` tinyint(1) DEFAULT '0' COMMENT '是否置顶',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `create_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `update_time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_user_fund` (`user_id`,`fund_code`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='自选基金表（只存关注关系）';

-- ----------------------------
-- Records of my_fund_watchlist
-- ----------------------------
BEGIN;
INSERT INTO `my_fund_watchlist` (`id`, `user_id`, `fund_name`, `fund_code`, `alias_name`, `group_name`, `is_pinned`, `sort_order`, `create_time`, `update_time`) VALUES ('3abf19c4-c151-4345-b4a8-89ed5b3bce49', NULL, '财通品质甄选混合C', '024481', NULL, NULL, 0, 0, '2026-06-30 13:44:16', NULL);
COMMIT;

-- ----------------------------
-- Table structure for portfolio_position
-- ----------------------------
DROP TABLE IF EXISTS `portfolio_position`;
CREATE TABLE `portfolio_position` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `portfolio_id` varchar(50) NOT NULL COMMENT '组合ID',
  `fund_code` varchar(10) NOT NULL COMMENT '基金代码',
  `weight` decimal(10,4) NOT NULL COMMENT '权重',
  `target_weight` decimal(10,4) DEFAULT NULL COMMENT '目标权重',
  `rebalance_flag` tinyint(1) DEFAULT '0' COMMENT '是否调仓',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_portfolio_fund` (`portfolio_id`,`fund_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='组合持仓表（资产配置层）';

-- ----------------------------
-- Records of portfolio_position
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for stock_basic
-- ----------------------------
DROP TABLE IF EXISTS `stock_basic`;
CREATE TABLE `stock_basic` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `stock_code` varchar(20) NOT NULL COMMENT '股票代码（A股/港股/美股统一编码）',
  `stock_name` varchar(100) NOT NULL COMMENT '股票名称',
  `exchange` varchar(10) DEFAULT NULL COMMENT '交易所（SH/SZ/HK/US）',
  `industry` varchar(50) DEFAULT NULL COMMENT '申万行业分类',
  `industry_level1` varchar(50) DEFAULT NULL COMMENT '一级行业',
  `industry_level2` varchar(50) DEFAULT NULL COMMENT '二级行业',
  `concept_tags` varchar(255) DEFAULT NULL COMMENT '概念标签（如AI/新能源/半导体）',
  `market_cap` decimal(20,4) DEFAULT NULL COMMENT '市值（亿元）',
  `listed_date` date DEFAULT NULL COMMENT '上市日期',
  `is_st` tinyint(1) DEFAULT '0' COMMENT '是否ST',
  `status` varchar(20) DEFAULT 'active' COMMENT '状态（正常/退市）',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stock_code` (`stock_code`),
  KEY `idx_industry` (`industry`),
  KEY `idx_level1` (`industry_level1`),
  KEY `idx_concept` (`concept_tags`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='股票基础信息维表（用于行业/概念/语义映射）';

-- ----------------------------
-- Records of stock_basic
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
