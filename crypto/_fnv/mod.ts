// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Fnv32, Fnv32A } from "./fnv32.ts";
import { Fnv64, Fnv64A } from "./fnv64.ts";

export function fnv(name: string, buf?: Uint8Array): ArrayBuffer {
  if (!buf) {
    throw new TypeError("no data provided for hashing");
  }

  let hasher: Fnv32 | Fnv32A | Fnv64 | Fnv64A;

  switch (name) {
    case "FNV32":
      hasher = new Fnv32();
      break;
    case "FNV64":
      hasher = new Fnv64();
      break;
    case "FNV32A":
      hasher = new Fnv32A();
      break;
    case "FNV64A":
      hasher = new Fnv64A();
      break;
    default:
      throw new TypeError(`unsupported FNV digest: ${name}`);
  }

  hasher.update(buf);

  return hasher.digest();
}
