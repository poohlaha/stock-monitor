SHELL := /bin/bash
help:
	@echo "webInstall - install web dependencies"
	@echo "run - run application"
	@echo "build - build application"


# 定义根路径
ROOT_ENCLOSURE_DIR = src-tauri
ROOT_WEB_DIR = ../stock-monitor-frontend

# 安装 web 依赖
webInstall:
	cd $(ROOT_WEB_DIR) && pnpm i

run:
	$(call webInstall)
	cd $(ROOT_ENCLOSURE_DIR) && pnpm i && pnpm tauri dev

buildDev:
	$(call webInstall)
	cd $(ROOT_ENCLOSURE_DIR) && pnpm i && pnpm tauri build --debug

build:
	$(call webInstall)
	cd $(ROOT_ENCLOSURE_DIR) && pnpm i && pnpm tauri build
	# cd $(ROOT_ENCLOSURE_DIR) && cargo build --release
	# strip $(ROOT_ENCLOSURE_DIR)/target/release/stock-monitor # 去除不必要的符号信息

    # pnpm tauri build --bundles app
