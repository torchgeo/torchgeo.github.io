SHELL := /bin/zsh

.PHONY: install check build dev clean

INSTALL_STAMP := node_modules/.bun-install-stamp

install: $(INSTALL_STAMP)

$(INSTALL_STAMP): bun.lock package.json
	@if [ -x node_modules/.bin/next ] && [ -x node_modules/.bin/biome ]; then \
		touch $@; \
	else \
		bun install; \
		touch $@; \
	fi

check: $(INSTALL_STAMP)
	bun run check

build: $(INSTALL_STAMP)
	bun run build

dev: $(INSTALL_STAMP)
	bun run dev

clean:
	rm -rf .next out node_modules
