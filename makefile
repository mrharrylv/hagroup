FRONTEND_DIR := services/frontend/it_company

.PHONY: install run dev build lint preview clean

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
