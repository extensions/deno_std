#!/usr/bin/env -S deno run
// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { assert, assertEquals } from "../../assert/mod.ts";

import { crypto as stdCrypto } from "../mod.ts";

import { crypto as stableStdCrypto } from "jsr:@std/crypto@0.220.1";

const webCrypto = globalThis.crypto;

/** Digest algorithms supported by WebCrypto. */
const webCryptoDigestAlgorithms = [
  "SHA-384",
  "SHA-256",
  "SHA-512",
  // insecure (length-extendable and collidable):
  "SHA-1",
] as const;

// Wasm is limited to 32-bit operations, which SHA-256 is optimized for, while
// SHA-512 is optimized for 64-bit operations and may be slower.
for (
  const algorithm of ["SHA-256", "SHA-512", "BLAKE3", "FNV32", "FNV64"] as const
) {
  for (
    const length of [
      64,
      262_144,
      4_194_304,
      67_108_864,
      524_291_328,
    ] as const
  ) {
    // Create a test input buffer and do some operations to hopefully ensure
    // it's fully initialized and not optimized away.
    const buffer = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = (i + (i % 13) + (i % 31)) % 255;
    }
    let sum = 0;
    for (const byte of buffer) {
      sum += byte;
    }
    assert(sum > 0);

    for (
      const implementation of [
        webCryptoDigestAlgorithms.includes(algorithm as any)
          ? "runtime WebCrypto"
          : false,
        "@std/crypto local",
        "@std/crypto@0.220.1",
      ].filter(Boolean)
    ) {
      let lastDigest: ArrayBuffer | undefined;

      Deno.bench({
        name: `${algorithm.padEnd(12)} ${
          length
            .toString()
            .padStart(12)
        }B ${implementation}`,
        async fn() {
          let digest;
          if (implementation === "@std/crypto local") {
            digest = stdCrypto.subtle.digestSync(algorithm, buffer);
          } else if (implementation === "@std/crypto@0.220.1") {
            digest = stableStdCrypto.subtle.digestSync(algorithm, buffer);
          } else if (implementation === "runtime WebCrypto") {
            digest = await webCrypto.subtle.digest(algorithm, buffer);
          } else {
            throw new Error(`Unknown implementation ${implementation}`);
          }

          assert(digest.byteLength > 0);

          if (lastDigest) {
            assertEquals(lastDigest, digest);
          }
          lastDigest = digest;
        },
      });
    }
  }
}
