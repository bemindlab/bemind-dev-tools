.PHONY: help install dev build start package clean clean-all

# Default target
help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Run development server"
	@echo "  make build       - Build the application"
	@echo "  make start       - Start the Electron app"
	@echo "  make package     - Package the application"
	@echo "  make clean       - Remove build artifacts"
	@echo "  make clean-all   - Remove build artifacts and dependencies"

# Install dependencies
install:
	npm install

# Run development server
dev:
	npm run dev

# Build the application
build:
	npm run build

# Start the Electron app
start:
	npm run start

# Package the application
package: build
	npm run package

# Clean build artifacts
clean:
	rm -rf dist/
	rm -rf out/
	rm -rf build/
	rm -f *.log

# Clean everything including node_modules
clean-all: clean
	rm -rf node_modules/
	rm -f package-lock.json
