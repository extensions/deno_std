// Ported from Go:
// https://github.com/golang/go/tree/go1.13.10/src/hash/fnv/fnv.go
// Copyright 2011 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { mul32, swap32 } from "./util.ts";

const PRIME_32 = 0x0100_0193;
const OFFSET_32 = 0x811C_9DC5;

export class Fnv32 {
  #hash = OFFSET_32;

  update(bytes: Uint8Array) {
    for (const byte of bytes) {
      this.#hash = mul32(this.#hash, PRIME_32);
      this.#hash ^= byte;
    }
  }

  digest(): ArrayBuffer {
    return Uint32Array.from([swap32(this.#hash)]).buffer;
  }
}

export class Fnv32A {
  #hash = OFFSET_32;

  update(bytes: Uint8Array) {
    for (const byte of bytes) {
      this.#hash ^= byte;
      this.#hash = mul32(this.#hash, PRIME_32);
    }
  }

  digest(): ArrayBuffer {
    return Uint32Array.from([swap32(this.#hash)]).buffer;
  }
}
