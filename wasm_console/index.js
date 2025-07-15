const encoder = new TextEncoder();

async function init() {
  // Fetch and instantiate the compiled WebAssembly module (log.wasm should be built first).
  const bytes = await fetch('log.wasm').then(r => r.arrayBuffer());
  const { instance } = await WebAssembly.instantiate(bytes, {});

  // Convenience handles to the exported members.
  const { memory, log_string, malloc, free } = instance.exports;

  // Preserve the original console.log in case you still want dev-tools output.
  const originalLog = console.log.bind(console);

  // Override console.log so every call is routed through Wasm.
  console.log = (...args) => {
    // 1) Flatten the variadic arguments into a single string.
    const message = args.map(String).join(' ');

    // 2) Encode the JavaScript string as UTF-8.
    const encoded = encoder.encode(message);
    const len = encoded.length;

    // 3) Allocate space inside Wasm memory and copy the bytes there.
    const ptr = malloc(len);
    new Uint8Array(memory.buffer, ptr, len).set(encoded);

    // 4) Invoke the Wasm function.
    log_string(ptr, len);

    // 5) Free the allocated memory.
    free(ptr);

    // (Optional) still print to the browser/Node console:
    // originalLog(...args);
  };

  // Example usage.
  console.log('Hello from JS, now handled in Wasm!', 123);
}

// Initialise when this script is loaded.
init().catch(err => console.error(err));