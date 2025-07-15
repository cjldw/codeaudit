class WasmConsoleOverride {
    constructor() {
        this.wasmModule = null;
        this.isInitialized = false;
        this.originalConsoleLog = console.log.bind(console);
        
        // Store original console.log globally for WASM to access
        window.originalConsoleLog = this.originalConsoleLog;
    }

    async initialize(wasmPath = './wasm_console.wasm') {
        try {
            // Load the WASM module
            const wasmModule = await WebAssembly.instantiateStreaming(
                fetch(wasmPath),
                {
                    env: {
                        // Add any imports your WASM module needs
                        emscripten_notify_memory_growth: function() {},
                    },
                    wasi_snapshot_preview1: {
                        // WASI imports if needed
                        fd_write: function() {},
                        fd_close: function() {},
                        fd_seek: function() {},
                        proc_exit: function() {},
                    }
                }
            );

            this.wasmModule = wasmModule.instance;
            
            // Initialize the WASM module
            if (this.wasmModule.exports.wasm_init) {
                this.wasmModule.exports.wasm_init();
            }

            this.isInitialized = true;
            this.originalConsoleLog('✅ WASM Console Override module loaded successfully');
            
            // Override console.log
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
                // Fallback to original if WASM not ready
                self.originalConsoleLog('[WASM Not Ready]', ...args);
                return;
            }

            try {
                // Convert all arguments to a single string
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                }).join(' ');

                // Call WASM function with the message
                self.callWasmLog(message);
                
            } catch (error) {
                // Fallback to original console.log if WASM call fails
                self.originalConsoleLog('[WASM Error]', error.message, '|', ...args);
            }
        };

        // Also override other console methods
        console.info = this.createOverrideFunction('INFO');
        console.warn = this.createOverrideFunction('WARN');
        console.error = this.createOverrideFunction('ERROR');
    }

    createOverrideFunction(level) {
        const self = this;
        return function(...args) {
            if (!self.isInitialized) {
                self.originalConsoleLog(`[WASM Not Ready][${level}]`, ...args);
                return;
            }

            try {
                const message = args.map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                }).join(' ');

                self.callWasmLogFormatted(level, message);
                
            } catch (error) {
                self.originalConsoleLog(`[WASM Error][${level}]`, error.message, '|', ...args);
            }
        };
    }

    callWasmLog(message) {
        if (!this.wasmModule || !this.wasmModule.exports.wasm_console_log) {
            throw new Error('WASM console log function not available');
        }

        // Allocate memory for the string in WASM
        const encoder = new TextEncoder();
        const messageBytes = encoder.encode(message + '\0'); // null-terminated
        
        const memoryPtr = this.wasmModule.exports.malloc(messageBytes.length);
        const memory = new Uint8Array(this.wasmModule.exports.memory.buffer);
        memory.set(messageBytes, memoryPtr);
        
        // Call WASM function
        this.wasmModule.exports.wasm_console_log(memoryPtr);
        
        // Free allocated memory
        this.wasmModule.exports.free(memoryPtr);
    }

    callWasmLogFormatted(level, message) {
        if (!this.wasmModule || !this.wasmModule.exports.wasm_console_log_formatted) {
            throw new Error('WASM formatted console log function not available');
        }

        // Allocate memory for level and message strings
        const encoder = new TextEncoder();
        const levelBytes = encoder.encode(level + '\0');
        const messageBytes = encoder.encode(message + '\0');
        
        const levelPtr = this.wasmModule.exports.malloc(levelBytes.length);
        const messagePtr = this.wasmModule.exports.malloc(messageBytes.length);
        
        const memory = new Uint8Array(this.wasmModule.exports.memory.buffer);
        memory.set(levelBytes, levelPtr);
        memory.set(messageBytes, messagePtr);
        
        // Call WASM function
        this.wasmModule.exports.wasm_console_log_formatted(levelPtr, messagePtr);
        
        // Free allocated memory
        this.wasmModule.exports.free(levelPtr);
        this.wasmModule.exports.free(messagePtr);
    }

    restore() {
        // Restore original console functions
        console.log = this.originalConsoleLog;
        console.info = console.info;
        console.warn = console.warn;
        console.error = console.error;
        
        this.originalConsoleLog('🔄 Console functions restored to original');
    }

    // Utility method to check if WASM is ready
    isReady() {
        return this.isInitialized;
    }
}

// Global instance
window.wasmConsoleOverride = new WasmConsoleOverride();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await window.wasmConsoleOverride.initialize();
        } catch (error) {
            console.error('Failed to auto-initialize WASM console override:', error);
        }
    });
} else {
    // DOM already loaded
    window.wasmConsoleOverride.initialize().catch(error => {
        console.error('Failed to auto-initialize WASM console override:', error);
    });
}