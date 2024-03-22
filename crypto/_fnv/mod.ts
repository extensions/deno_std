// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.

import { Fnv32, Fnv32A } from "./fnv32.ts";
import { Fnv64, Fnv64A } from "./fnv64.ts";

export const FNV_IMPLEMENTATIONS = {
  "FNV32": Fnv32,
  "FNV32A": Fnv32A,
  "FNV64": Fnv64,
  "FNV64A": Fnv64A,
};

export const FNV_LENGTHS = {
  "FNV32": 4,
  "FNV32A": 4,
  "FNV64": 8,
  "FNV64A": 8,
};
