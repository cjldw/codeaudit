# 🚀 Quick Start: WASM Console Override

This project provides a complete solution for overriding JavaScript's `console.log` function using WebAssembly (WASM).

## 📱 Immediate Demo (No Compilation Required)

**Try it right now:**
```bash
# Open the simulation demo directly in your browser
open simple_demo.html
# or serve it locally:
python3 -m http.server 8000
# Then visit: http://localhost:8000/simple_demo.html
```

This simulation shows how the WASM override would work without requiring compilation.

## 🔧 Full WASM Implementation

### Prerequisites
1. **Emscripten SDK** (for compiling C to WASM)
2. **Web Server** (due to CORS restrictions)

### Quick Setup
```bash
# 1. Install Emscripten (one-time setup)
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# 2. Return to project directory and build
cd /path/to/your/project
chmod +x build.sh
./build.sh

# 3. Start web server
python3 -m http.server 8000

# 4. Open demo
# Visit: http://localhost:8000/demo.html
```

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `simple_demo.html` | **START HERE** - Works immediately, no compilation |
| `wasm_console.c` | C source code for WASM module |
| `build.sh` | Compilation script |
| `demo.html` | Full WASM demo (requires compilation) |
| `wasm_console_override.js` | Original JavaScript wrapper |
| `wasm_console_emscripten.js` | Emscripten-compatible wrapper |
| `WASM_CONSOLE_README.md` | Complete documentation |

## 🎯 Usage Examples

### Basic Override
```javascript
// After loading the script
console.log('Hello World'); 
// Output: [WASM Override 2024-01-15T10:30:45.123Z] Hello World

// Restore original
window.wasmConsoleOverride.restore();
```

### Custom Processing
```javascript
// The WASM module can:
// - Add timestamps and metadata
// - Filter sensitive information  
// - Send logs to remote servers
// - Apply custom formatting
// - Perform security checks
```

## ⚡ Key Features

- ✅ **Override console.log, info, warn, error**
- ✅ **Custom WASM processing**
- ✅ **Memory management**
- ✅ **Fallback support**
- ✅ **Easy restoration**
- ✅ **TypeScript-friendly**

## 🎮 Testing the Override

```javascript
// Test different data types
console.log('String message');
console.log({ key: 'value', nested: { data: 123 } });
console.log([1, 2, 3, 'array']);
console.log(true, false, null, undefined);

// Test different levels
console.info('Information message');
console.warn('Warning message');
console.error('Error message');
```

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Use web server, not `file://` |
| Build fails | Check Emscripten installation |
| WASM not loading | Verify file paths and server |
| Console not working | Check browser developer tools |

## 📚 Next Steps

1. **Try the simulation**: Open `simple_demo.html`
2. **Read full docs**: See `WASM_CONSOLE_README.md`
3. **Build real WASM**: Follow build instructions
4. **Customize**: Modify `wasm_console.c` for your needs

## 💡 Use Cases

- **Security**: Filter sensitive information from logs
- **Performance**: Add timing and profiling data
- **Remote Logging**: Send logs to external services
- **Debugging**: Enhanced debugging information
- **Compliance**: Audit trail and log management

---

**Get started in 30 seconds:** Just open `simple_demo.html` in your browser! 🎉