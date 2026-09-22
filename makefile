FRONTEND_DIR := services/frontend/it_company
KOPA_DIR := kopa/service/frontend

.PHONY: install run dev build lint preview clean \
        kopa-install kopa-dev kopa-build kopa-lint kopa-test kopa-verify kopa-clean

## Install dependencies
install:
	cd $(FRONTEND_DIR) && npm install

## Start development server
run:
	cd $(FRONTEND_DIR) && npm run dev

## Start development server
dev:
	cd $(FRONTEND_DIR) && npm run dev

## Production build
build:
	cd $(FRONTEND_DIR) && npm run build

## Run linter
lint:
	cd $(FRONTEND_DIR) && npm run lint

## Preview production build
preview:
	cd $(FRONTEND_DIR) && npm run preview

## Remove node_modules and build artifacts
clean:
	rm -rf $(FRONTEND_DIR)/node_modules $(FRONTEND_DIR)/dist

## --- Kopā (group-buying demo) -------------------------------------------

## Install Kopā dependencies
kopa-install:
	cd $(KOPA_DIR) && npm install

## Start the Kopā development server
kopa-dev:
	cd $(KOPA_DIR) && npm run dev

## Production build of Kopā
kopa-build:
	cd $(KOPA_DIR) && npm run build

## Lint Kopā
kopa-lint:
	cd $(KOPA_DIR) && npm run lint

## Test Kopā
kopa-test:
	cd $(KOPA_DIR) && npm run test

## Full Kopā gate: lint, test, build — the same thing CI runs
kopa-verify:
	cd $(KOPA_DIR) && npm run verify

## Remove Kopā node_modules and build artifacts
kopa-clean:
	rm -rf $(KOPA_DIR)/node_modules $(KOPA_DIR)/dist
