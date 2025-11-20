.PHONY: help install dev build start package package-mac package-win package-linux test test-watch test-ui lint clean clean-all

# Default target
help:
	@echo "Bemind Dev Tools - Available Commands"
	@echo "======================================"
	@echo ""
	@echo "Development:"
	@echo "  make install       - Install dependencies with pnpm"
	@echo "  make dev           - Run development server with hot reload"
	@echo "  make lint          - Run TypeScript type checking"
	@echo ""
	@echo "Building:"
	@echo "  make build         - Build the application for production"
	@echo "  make start         - Start the built Electron app"
	@echo ""
	@echo "Packaging:"
	@echo "  make package       - Package for current platform"
	@echo "  make package-mac   - Package for macOS (dmg + zip)"
	@echo "  make package-win   - Package for Windows (nsis + portable)"
	@echo "  make package-linux - Package for Linux (AppImage + deb)"
	@echo ""
	@echo "Testing:"
	@echo "  make test          - Run all tests once"
	@echo "  make test-watch    - Run tests in watch mode"
	@echo "  make test-ui       - Open Vitest UI"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean         - Remove build artifacts"
	@echo "  make clean-all     - Remove build artifacts and dependencies"

# Install dependencies with pnpm
install:
	@echo "Installing dependencies..."
	pnpm install

# Run development server with hot reload
# Starts TypeScript compiler in watch mode, Vite dev server, and Electron with hot reload
# - Main process changes trigger automatic app restart (electron-reload)
# - Renderer changes trigger hot module replacement (Vite HMR)
# - Opens DevTools automatically in development mode
dev:
	@echo "Starting development server with hot reload..."
	pnpm run dev

# Run TypeScript type checking
lint:
	@echo "Running TypeScript type checking..."
	pnpm run lint

# Build the application for production
build:
	@echo "Building application..."
	pnpm run build

# Start the Electron app (production mode)
start:
	@echo "Starting Electron app..."
	pnpm run start

# Package the application for current platform
package:
	@echo "Packaging application for current platform..."
	pnpm run package

# Package for macOS
package-mac:
	@echo "Packaging for macOS..."
	pnpm run package:mac

# Package for Windows
package-win:
	@echo "Packaging for Windows..."
	pnpm run package:win

# Package for Linux
package-linux:
	@echo "Packaging for Linux..."
	pnpm run package:linux

# Run tests once
test:
	@echo "Running tests..."
	pnpm run test

# Run tests in watch mode
test-watch:
	@echo "Running tests in watch mode..."
	pnpm run test:watch

# Open Vitest UI
test-ui:
	@echo "Opening Vitest UI..."
	pnpm run test:ui

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	pnpm run clean

# Clean everything including node_modules and pnpm lock
clean-all:
	@echo "Cleaning everything..."
	pnpm run clean:all
