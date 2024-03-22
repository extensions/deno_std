// Ported from Go:
// https://github.com/golang/go/tree/go1.13.10/src/hash/fnv/fnv.go
// Copyright 2011 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { mul64, swap32 } from "./util.ts";

const PRIME_64_HIGH = 256;
const PRIME_64_LOW = 435;
const OFFSET_64_HIGH = 3421674724;
const OFFSET_64_LOW = 2216829733;

export class Fnv64 {
  #hashHigh = OFFSET_64_HIGH;
  #hashLow = OFFSET_64_LOW;

  update(bytes: Uint8Array) {
    for (const byte of bytes) {
      [this.#hashHigh, this.#hashLow] = mul64([this.#hashHigh, this.#hashLow], [
        PRIME_64_HIGH,
        PRIME_64_LOW,
      ]);
      this.#hashLow ^= byte;
    }
  }

  digest(): ArrayBuffer {
    return new Uint32Array([
      swap32(this.#hashHigh >>> 0),
      swap32(this.#hashLow >>> 0),
    ]).buffer;
  }
}

export class Fnv64A {
  #hashHigh = OFFSET_64_HIGH;
  #hashLow = OFFSET_64_LOW;

  update(bytes: Uint8Array) {
    for (const byte of bytes) {
      this.#hashLow ^= byte;
      [this.#hashHigh, this.#hashLow] = mul64([this.#hashHigh, this.#hashLow], [
        PRIME_64_HIGH,
        PRIME_64_LOW,
      ]);
    }
  }

  digest(): ArrayBuffer {
    return new Uint32Array([
      swap32(this.#hashHigh >>> 0),
      swap32(this.#hashLow >>> 0),
    ]).buffer;
  }
}
