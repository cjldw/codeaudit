#include <emscripten.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// JavaScript import declarations
EM_JS(void, js_log_to_console, (const char* message), {
    // Custom logging logic - you can modify this as needed
    const msg = UTF8ToString(message);
    const timestamp = new Date().toISOString();
    const customMessage = `[WASM Override ${timestamp}] ${msg}`;
    
    // Call the original console.log (stored before override)
    if (window.originalConsoleLog) {
        window.originalConsoleLog(customMessage);
    } else {
        // Fallback if original wasn't stored
        console.error('[WASM] Original console.log not found:', customMessage);
    }
});

// Function to be called from JavaScript
EMSCRIPTEN_KEEPALIVE
void wasm_console_log(const char* message) {
    // Add WASM-specific processing here if needed
    js_log_to_console(message);
}

// Initialize function
EMSCRIPTEN_KEEPALIVE
void wasm_init() {
    printf("WASM Console Override Module Initialized\n");
}

// Custom formatting function
EMSCRIPTEN_KEEPALIVE
void wasm_console_log_formatted(const char* level, const char* message) {
    char formatted_message[1024];
    snprintf(formatted_message, sizeof(formatted_message), "[%s] %s", level, message);
    js_log_to_console(formatted_message);
}