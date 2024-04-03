import { instantiateWasm } from "./_wasm/mod.ts";
import { encodeHex } from "../encoding/hex.ts";

const wasm = instantiateWasm();

export function digest(input: Uint8Array): Digest {
  throw new Error("todo");
}

export interface Digest {
  get256(): Uint8Array;
  toString(): string;
  slice(offset: number, length: number): Uint8Array;
  read(): ReadableStream;
}

export class Digest implements Digest {
  get256() {
    return this.slice(0, 256 / 8);
  }

  toString() {
    return encodeHex(this.get256());
  }

  read() {
    let offset = 0;
    return new ReadableStream({
      type: "bytes",
      pull: (controller) => {
        const buffer = controller.byobRequest!.view!.buffer;
        const bytes = this.slice(offset, buffer.byteLength);
        new Uint8Array(buffer).set(bytes);
        offset += buffer.byteLength;
        controller.byobRequest!.respond(buffer.byteLength);
      },
    });
  }
}

interface HashedSliced {
  /** root digest, arbitrary length but typically 32 bytes */
  digest: Uint8Array;

  /** the slice contents (which implies the length) */
  data: Uint8Array;

  /** the offset into the input data that this slice represents */
  offset?: number;

  /** 32-bit intermediate hashes preceeding this block, followed by the chunk chaining value if not first chunk */
  preceeding: Array<Uint8Array>;

  /** up to 63 bytes of preceeding data in this chunk */
  prefix: Uint8Array;

  /** up to 1023 of data required to complete this block */
  suffix: Uint8Array;

  /** Array of 32-bit intermediate hashes following this block */
  succeeding: Array<Uint8Array>;
}

/**
 * internal digest state required to generate output blocks.
 *
 * note that this may also allow for length extension attacks if the tree is full (if length is less than 1024 or is a power of two).
 */
interface ExtendableDigest {
  /** total input length 32u */
  totalInputLength: Uint32Array;

  /** root chunk message body, up to 64 bytes */
  message: Uint8Array;

  /** chaining value if not default (IV), only set if input length is between 33 and 1023 bytes. */
  chaining: Uint8Array;
}

// ascii-printable: preserved as-is
// everything else: indicates that the next 3 * N characters are to be decoded as base64?
// \x01
// Wait, no, JSON doesn't support \x, so they'll all have to be \u! That's kind-of annoying and clunky.
// Maybe go back to your original thought of just delimiting the blocks with ~
