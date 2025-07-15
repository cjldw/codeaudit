const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function init() {
  // Fetch the Wasm module bytes.
  const bytes = await fetch('log.wasm').then(r => r.arrayBuffer());

  // We'll fill this reference after instantiation so the import can access memory.
  let memoryRef;

  const originalLog = console.log.bind(console);

  // Import object: the Wasm module will call env.log_sink(ptr,len).
  const importObject = {
    env: {
      log_sink(ptr, len) {
        // Decode the UTF-8 message from Wasm memory and print it.
        const msg = decoder.decode(new Uint8Array(memoryRef.buffer, ptr, len));
        originalLog('[WASM]', msg);
      }
    }
  };

  // Instantiate with imports so `log_sink` is wired up.
  const { instance } = await WebAssembly.instantiate(bytes, importObject);

  // Convenience handles to the exported members.
  const { memory, log_string, malloc, free } = instance.exports;
  memoryRef = memory;

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