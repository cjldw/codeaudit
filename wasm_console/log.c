#include <stdint.h>
#include <stddef.h>

// -----------------------------------------------------------------------------
// JavaScript import: JS provides this function in the `env` module. It will
// receive the same UTF-8 bytes we got from JS originally and can do anything
// with them (console.log, send over network, etc.).
// -----------------------------------------------------------------------------
__attribute__((import_module("env"), import_name("log_sink")))
void log_sink(uintptr_t ptr, size_t len);

// -----------------------------------------------------------------------------
// Simple bump-pointer allocator so JS can call malloc/free from the Wasm side.
// This avoids pulling in the full libc malloc implementation.
// -----------------------------------------------------------------------------
static uintptr_t heap_ptr = 0;  // first free byte

__attribute__((export_name("malloc")))
uintptr_t wasm_malloc(size_t size) {
    // Align to 8 bytes for good measure.
    const uintptr_t align = 8u;
    if (!heap_ptr) {
        // `__heap_base` is provided by the linker and marks the start of free
        // linear-memory after static data.
        extern unsigned char __heap_base;
        heap_ptr = (uintptr_t)&__heap_base;
    }
    heap_ptr = (heap_ptr + (align - 1)) & ~(align - 1); // align up
    uintptr_t ret = heap_ptr;
    heap_ptr += size;

    // Grow memory if we ran out.
    const uintptr_t page_size = 65536u;
    uintptr_t current_bytes = __builtin_wasm_memory_size(0) * page_size;
    if (heap_ptr > current_bytes) {
        uintptr_t delta_pages = (heap_ptr - current_bytes + page_size - 1) / page_size;
        __builtin_wasm_memory_grow(0, delta_pages);
    }
    return ret;
}

// No-op free (bump allocators can’t reclaim memory, that’s fine for logging).
__attribute__((export_name("free")))
void wasm_free(uintptr_t ptr) {
    (void)ptr;
}

// -----------------------------------------------------------------------------
// The main entry called from JavaScript. Forward the message bytes to log_sink.
// -----------------------------------------------------------------------------
__attribute__((export_name("log_string")))
void log_string(uintptr_t ptr, size_t len) {
    log_sink(ptr, len);
}