# WASM Console.log Override

This project demonstrates how to use WebAssembly (WASM) to override JavaScript's `console.log` function and other console methods. The WASM module intercepts console calls, adds custom formatting, timestamps, and processing before displaying the output.

## 🚀 Features

- **Override console.log**: Replace JavaScript console logging with WASM-powered version
- **Custom formatting**: Add timestamps, log levels, and custom processing
- **Multiple console methods**: Support for `console.log`, `console.info`, `console.warn`, `console.error`
- **Memory management**: Proper string handling between JavaScript and WASM
- **Fallback support**: Multiple loading strategies for different environments
- **Easy restoration**: Restore original console functions when needed

## 📁 Files Structure

```
├── wasm_console.c                  # C source code for WASM module
├── wasm_console_override.js        # Original JavaScript wrapper
├── wasm_console_emscripten.js      # Emscripten-compatible wrapper
├── demo.html                       # Interactive demonstration
├── build.sh                       # Build script for compilation
└── WASM_CONSOLE_README.md          # This documentation
```

## 🛠️ Prerequisites

1. **Emscripten SDK**: Required to compile C to WebAssembly
   ```bash
   # Install Emscripten
   git clone https://github.com/emscripten-core/emsdk.git
   cd emsdk
   ./emsdk install latest
   ./emsdk activate latest
   source ./emsdk_env.sh
   ```

2. **Web Server**: Required to serve files (due to CORS restrictions)
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

## 🔨 Building

1. Make the build script executable:
   ```bash
   chmod +x build.sh
   ```

2. Run the build script:
   ```bash
   ./build.sh
   ```

   This will generate:
   - `wasm_console.wasm` - WebAssembly binary
   - `wasm_console.js` - Emscripten glue code

## 🎮 Usage

### Method 1: Using Emscripten (Recommended)

```html
<!DOCTYPE html>
<html>
<head>
    <title>WASM Console Override</title>
</head>
<body>
    <!-- Load the Emscripten version -->
    <script src="wasm_console_emscripten.js"></script>
    
    <script>
        // The override is automatically initialized
        // Test it with:
        console.log('Hello from WASM!');
        console.info('Info message');
        console.warn('Warning message');
        console.error('Error message');
        
        // Restore original functions
        // window.wasmConsoleOverride.restore();
    </script>
</body>
</html>
```

### Method 2: Manual WASM Loading

```html
<!DOCTYPE html>
<html>
<head>
    <title>WASM Console Override</title>
</head>
<body>
    <script src="wasm_console_override.js"></script>
    
    <script>
        // Manual initialization
        window.wasmConsoleOverride.initialize().then(() => {
            console.log('WASM console override ready!');
        });
    </script>
</body>
</html>
```

### Method 3: Programmatic Control

```javascript
class MyApp {
    async init() {
        // Initialize WASM console override
        this.consoleOverride = new WasmConsoleOverrideEmscripten();
        await this.consoleOverride.initialize();
        
        // Now all console calls are processed by WASM
        console.log('This goes through WASM processing');
    }
    
    cleanup() {
        // Restore original console functions
        this.consoleOverride.restore();
    }
}
```

## 🎯 Demo

Open `demo.html` in a web browser (served through a web server) to see an interactive demonstration. The demo includes:

- Live console override functionality
- Test buttons for different console methods
- Status monitoring
- Control functions (restore, reinitialize)

## 🔧 Customization

### Modifying the C Code

Edit `wasm_console.c` to customize the logging behavior:

```c
// Add custom processing in this function
EMSCRIPTEN_KEEPALIVE
void wasm_console_log(const char* message) {
    // Your custom logic here
    // - Filter sensitive information
    // - Add encryption
    // - Send to remote logging service
    // - Apply custom formatting
    
    js_log_to_console(message);
}
```

### JavaScript Customization

Modify the JavaScript wrapper to change behavior:

```javascript
overrideConsoleLog() {
    const self = this;
    
    console.log = function(...args) {
        // Add your pre-processing here
        const message = self.formatArgs(args);
        
        // Add filtering, validation, etc.
        if (self.shouldLog(message)) {
            self.callWasmLog(message);
        }
    };
}
```

## 📋 API Reference

### WasmConsoleOverrideEmscripten

#### Methods

- `initialize()` - Load and initialize the WASM module
- `restore()` - Restore original console functions
- `isReady()` - Check if WASM module is ready
- `callWasmLog(message)` - Directly call WASM logging function
- `callWasmLogFormatted(level, message)` - Call WASM with log level

#### Events

The system automatically overrides these console methods:
- `console.log()`
- `console.info()`
- `console.warn()`
- `console.error()`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Solution: Serve files through a web server, not file:// protocol
   ```

2. **Build Failures**
   ```bash
   # Check Emscripten installation
   emcc --version
   
   # Ensure emsdk is activated
   source /path/to/emsdk/emsdk_env.sh
   ```

3. **WASM Loading Fails**
   ```
   - Check file paths in HTML
   - Verify web server is running
   - Check browser console for errors
   ```

4. **Module Not Found**
   ```javascript
   // Check if files exist and paths are correct
   console.log(typeof window.wasmConsoleOverride);
   ```

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Requires HTTPS for some features
- **Mobile browsers**: Generally supported

## 🎨 Advanced Examples

### Logging to Remote Server

```c
// In wasm_console.c
EM_JS(void, send_log_to_server, (const char* message), {
    const msg = UTF8ToString(message);
    fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, timestamp: Date.now() })
    });
});
```

### Log Filtering

```javascript
formatArgs(args) {
    return args.map(arg => {
        // Filter out sensitive data
        if (typeof arg === 'string' && arg.includes('password')) {
            return '[FILTERED]';
        }
        return this.originalFormatArgs(arg);
    }).join(' ');
}
```

### Performance Monitoring

```c
// Add performance timing in C
EMSCRIPTEN_KEEPALIVE
void wasm_console_log_with_timing(const char* message) {
    double start_time = emscripten_get_now();
    
    js_log_to_console(message);
    
    double end_time = emscripten_get_now();
    double duration = end_time - start_time;
    
    if (duration > 1.0) { // Log slow operations
        char timing_msg[256];
        snprintf(timing_msg, sizeof(timing_msg), 
                 "[PERFORMANCE] Log took %.2fms", duration);
        js_log_to_console(timing_msg);
    }
}
```

## 📚 Resources

- [WebAssembly Documentation](https://webassembly.org/)
- [Emscripten Documentation](https://emscripten.org/docs/)
- [MDN WebAssembly Guide](https://developer.mozilla.org/en-US/docs/WebAssembly)

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Contributing

Feel free to modify and extend this code for your specific use cases. Some ideas for improvements:

- Add configuration options
- Implement log rotation
- Add compression for large logs
- Create TypeScript definitions
- Add automated tests