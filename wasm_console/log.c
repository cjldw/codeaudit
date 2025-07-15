#include <stdint.h>
#include <stddef.h>

// Exported function that receives a UTF-8 encoded string located in the module’s linear memory.
//   ptr  – byte offset of the first character
//   len  – byte length of the string
// Inside this function you can route the bytes anywhere you like (WASI fd_write, networking, etc.).
__attribute__((export_name("log_string")))
void log_string(uintptr_t ptr, size_t len) {
    // Demo implementation: currently a no-op.
    // Replace this with your own handling logic (e.g. write to WASI stdout).
    (void)ptr;
    (void)len;
}