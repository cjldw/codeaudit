class WasmConsoleOverrideEmscripten {
    constructor() {
        this.wasmModule = null;
        this.isInitialized = false;
        this.originalConsoleLog = console.log.bind(console);
        this.originalConsoleInfo = console.info.bind(console);
        this.originalConsoleWarn = console.warn.bind(console);
        this.originalConsoleError = console.error.bind(console);
        
        // Store original console functions globally for WASM to access
        window.originalConsoleLog = this.originalConsoleLog;
    }

    async initialize() {
        try {
            // Load the Emscripten-generated module
            const WasmConsoleModule = await import('./wasm_console.js');
            this.wasmModule = await WasmConsoleModule.default();
            
            // Initialize the WASM module
            if (this.wasmModule._wasm_init) {
                this.wasmModule._wasm_init();
            }

            this.isInitialized = true;
            this.originalConsoleLog('✅ WASM Console Override module (Emscripten) loaded successfully');
            
            // Override console functions
            this.overrideConsoleLog();
            
        } catch (error) {
            console.error('❌ Failed to load WASM module:', error);
            throw error;
        }
    }

    overrideConsoleLog() {
        const self = this;
        
        // Override console.log with WASM-powered version
        console.log = function(...args) {
            if (!self.isInitialized) {
                self.originalConsoleLog('[WASM Not Ready]', ...args);
                return;
            }

            try {
                const message = self.formatArgs(args);
                self.callWasmLog(message);
            } catch (error) {
                self.originalConsoleLog('[WASM Error]', error.message, '|', ...args);
            }
        };

        console.info = function(...args) {
            if (!self.isInitialized) {
                self.originalConsoleInfo('[WASM Not Ready]', ...args);
                return;
            }

            try {
                const message = self.formatArgs(args);
                self.callWasmLogFormatted('INFO', message);
            } catch (error) {
                self.originalConsoleInfo('[WASM Error]', error.message, '|', ...args);
            }
        };

        console.warn = function(...args) {
            if (!self.isInitialized) {
                self.originalConsoleWarn('[WASM Not Ready]', ...args);
                return;
            }

            try {
                const message = self.formatArgs(args);
                self.callWasmLogFormatted('WARN', message);
            } catch (error) {
                self.originalConsoleWarn('[WASM Error]', error.message, '|', ...args);
            }
        };

        console.error = function(...args) {
            if (!self.isInitialized) {
                self.originalConsoleError('[WASM Not Ready]', ...args);
                return;
            }

            try {
                const message = self.formatArgs(args);
                self.callWasmLogFormatted('ERROR', message);
            } catch (error) {
                self.originalConsoleError('[WASM Error]', error.message, '|', ...args);
            }
        };
    }

    formatArgs(args) {
        return args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
    }

    callWasmLog(message) {
        if (!this.wasmModule || !this.wasmModule._wasm_console_log) {
            throw new Error('WASM console log function not available');
        }

        // Use Emscripten's string conversion utilities
        const messagePtr = this.wasmModule.stringToUTF8OnStack(message);
        this.wasmModule._wasm_console_log(messagePtr);
    }

    callWasmLogFormatted(level, message) {
        if (!this.wasmModule || !this.wasmModule._wasm_console_log_formatted) {
            throw new Error('WASM formatted console log function not available');
        }

        // Use Emscripten's string conversion utilities
        const levelPtr = this.wasmModule.stringToUTF8OnStack(level);
        const messagePtr = this.wasmModule.stringToUTF8OnStack(message);
        this.wasmModule._wasm_console_log_formatted(levelPtr, messagePtr);
    }

    restore() {
        // Restore original console functions
        console.log = this.originalConsoleLog;
        console.info = this.originalConsoleInfo;
        console.warn = this.originalConsoleWarn;
        console.error = this.originalConsoleError;
        
        this.originalConsoleLog('🔄 Console functions restored to original');
    }

    isReady() {
        return this.isInitialized;
    }
}

// Fallback loader for manual WASM loading (without Emscripten JS)
class WasmConsoleOverrideManual {
    constructor() {
        this.wasmModule = null;
        this.isInitialized = false;
        this.originalConsoleLog = console.log.bind(console);
        this.originalConsoleInfo = console.info.bind(console);
        this.originalConsoleWarn = console.warn.bind(console);
        this.originalConsoleError = console.error.bind(console);
        
        window.originalConsoleLog = this.originalConsoleLog;
    }

    async initialize(wasmPath = './wasm_console.wasm') {
        try {
            // Simple WASM instantiation
            const wasmModule = await WebAssembly.instantiateStreaming(
                fetch(wasmPath),
                {
                    env: {
                        // Basic imports
                        memory: new WebAssembly.Memory({ initial: 256 }),
                    }
                }
            );

            this.wasmModule = wasmModule.instance;
            this.isInitialized = true;
            this.originalConsoleLog('✅ WASM Console Override module (Manual) loaded successfully');
            this.overrideConsoleLog();
            
        } catch (error) {
            console.error('❌ Failed to load WASM module manually:', error);
            throw error;
        }
    }

    overrideConsoleLog() {
        const self = this;
        
        console.log = function(...args) {
            const message = args.join(' ');
            const timestamp = new Date().toISOString();
            const formattedMessage = `[WASM Manual Override ${timestamp}] ${message}`;
            self.originalConsoleLog(formattedMessage);
        };
    }

    restore() {
        console.log = this.originalConsoleLog;
        console.info = this.originalConsoleInfo;
        console.warn = this.originalConsoleWarn;
        console.error = this.originalConsoleError;
        this.originalConsoleLog('🔄 Console functions restored to original');
    }

    isReady() {
        return this.isInitialized;
    }
}

// Auto-detect and initialize
async function initializeWasmConsole() {
    // Try Emscripten version first
    try {
        window.wasmConsoleOverride = new WasmConsoleOverrideEmscripten();
        await window.wasmConsoleOverride.initialize();
        return true;
    } catch (error) {
        console.warn('Emscripten version failed, trying manual fallback:', error.message);
        
        // Fallback to manual version
        try {
            window.wasmConsoleOverride = new WasmConsoleOverrideManual();
            await window.wasmConsoleOverride.initialize();
            return true;
        } catch (fallbackError) {
            console.error('Both WASM loading methods failed:', fallbackError);
            return false;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWasmConsole);
} else {
    initializeWasmConsole();
}