.PHONY: setup dev dev-server dev-web test lint typecheck

setup:
	corepack enable || true
	pnpm i
	python -m pip install -r apps/server/requirements.txt

dev: dev-server dev-web

dev-server:
	cd apps/server && pnpm dev

dev-web:
	cd apps/web && pnpm dev

test:
	pnpm test:e2e

lint:
	pnpm -C apps/web lint || true

typecheck:
	pnpm -C apps/web typecheck || true