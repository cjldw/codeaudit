LOG_WASM = log.wasm

.PHONY: all clang emcc clean

# Default target: build with clang/LLVM (requires wasm32 target)
all: clang

# Build via clang & lld.
clang: $(LOG_WASM)

$(LOG_WASM): log.c
	clang --target=wasm32 -O3 -nostdlib \
	      -Wl,--no-entry -Wl,--export=log_string -Wl,--export=malloc -Wl,--export=free \
	      -o $@ $<

# Alternative build via Emscripten. Run `make emcc` if you have emcc instead of clang.
emcc:
	emcc log.c -O3 -s STANDALONE_WASM=1 \
	     -s EXPORTED_FUNCTIONS="['_log_string','_malloc','_free']" \
	     -o log.wasm

clean:
	rm -f $(LOG_WASM)