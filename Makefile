.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help:
	@printf "%s\n" \
		"make install-hooks     wire .githooks" \
		"make dev               run the frontend dev server" \
		"make build             build Pages-ready site into docs/" \
		"make test              run unit tests" \
		"make test-integration  run browser e2e tests" \
		"make smoke             build, serve, and run happy-path smoke test" \
		"make lint              run linters and type checks" \
		"make fmt               autoformat source" \
		"make pages-preview     preview the Pages build locally" \
		"make release           tag v0.1.0 after local checks" \
		"make clean             remove generated local artifacts"

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

test-integration:
	npm run test:e2e

smoke:
	npm run smoke

lint:
	npm run format:check
	npm run lint
	npm run typecheck

fmt:
	npm run fmt

pages-preview:
	npm run build
	npm run preview

release: smoke
	git tag v0.1.0

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push

clean:
	rm -rf coverage .tmp node_modules/.tmp test-results playwright-report
