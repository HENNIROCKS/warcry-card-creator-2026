HERD_NODE := $(HOME)/Library/Application Support/Herd/config/nvm/versions/node/v22.22.0/bin
export PATH := $(HERD_NODE):$(PATH)

dev:
	npm run dev -- --open

build:
	npm run build

preview:
	npm run preview
