#!/bin/bash

# Build script for WASM Console Override
# Requires Emscripten to be installed

echo "🔨 Building WASM Console Override Module..."

# Check if emcc is available
if ! command -v emcc &> /dev/null; then
    echo "❌ Error: emcc (Emscripten) not found!"
    echo "Please install Emscripten: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -f wasm_console.wasm wasm_console.js wasm_console.html

# Compile to WASM with Emscripten
echo "⚙️ Compiling C to WASM..."
emcc wasm_console.c \
    -o wasm_console.js \
    -s WASM=1 \
    -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "UTF8ToString", "stringToUTF8", "malloc", "free"]' \
    -s EXPORTED_FUNCTIONS='["_wasm_console_log", "_wasm_console_log_formatted", "_wasm_init", "_malloc", "_free"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='WasmConsoleModule' \
    -s ENVIRONMENT='web,worker' \
    -s SINGLE_FILE=0 \
    --no-entry

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Generated files:"
    echo "   - wasm_console.wasm (WebAssembly binary)"
    echo "   - wasm_console.js (Emscripten glue code)"
    echo ""
    echo "🚀 To test: Open demo.html in a web server"
    echo "   Example: python3 -m http.server 8000"
else
    echo "❌ Build failed!"
    exit 1
fi