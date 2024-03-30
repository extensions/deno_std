// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
use digest::core_api::BlockSizeUser;

const BASIS_32: u32 = 2166136261;
const PRIME_32: u32 = 16777619;

const BASIS_64: u64 = 14695981039346656037;
const PRIME_64: u64 = 1099511628211;

#[derive(Debug, Clone)]
pub struct Fnv32 {
  state: u32,
}

impl Default for Fnv32 {
  fn default() -> Fnv32 {
    Fnv32::new()
  }
}

impl BlockSizeUser for Fnv32 {
  type BlockSize = typenum::U1;
}

impl Fnv32 {
  pub fn new() -> Fnv32 {
    Fnv32 { state: BASIS_32 }
  }

  pub fn update(&mut self, bytes: impl AsRef<[u8]>) {
    for byte in bytes.as_ref() {
      self.state = self.state.wrapping_mul(PRIME_32);
      self.state ^= u32::from(*byte);
    }
  }

  pub fn digest(&self) -> Box<[u8]> {
    Box::new(self.state.to_be_bytes())
  }
}

#[derive(Debug, Clone)]
pub struct Fnv32A {
  state: u32,
}

impl Default for Fnv32A {
  fn default() -> Fnv32A {
    Fnv32A::new()
  }
}

impl BlockSizeUser for Fnv32A {
  type BlockSize = typenum::U1;
}

impl Fnv32A {
  pub fn new() -> Fnv32A {
    Fnv32A { state: BASIS_32 }
  }

  pub fn update(&mut self, bytes: impl AsRef<[u8]>) {
    for byte in bytes.as_ref() {
      self.state ^= u32::from(*byte);
      self.state = self.state.wrapping_mul(PRIME_32);
    }
  }

  pub fn digest(&self) -> Box<[u8]> {
    Box::new(self.state.to_be_bytes())
  }
}

#[derive(Debug, Clone)]
pub struct Fnv64 {
  state: u64,
}

impl BlockSizeUser for Fnv64 {
  type BlockSize = typenum::U1;
}

impl Default for Fnv64 {
  fn default() -> Fnv64 {
    Fnv64::new()
  }
}

impl Fnv64 {
  pub fn new() -> Fnv64 {
    Fnv64 { state: BASIS_64 }
  }

  pub fn update(&mut self, bytes: impl AsRef<[u8]>) {
    for byte in bytes.as_ref() {
      self.state = self.state.wrapping_mul(PRIME_64);
      self.state ^= u64::from(*byte);
    }
  }

  pub fn digest(&self) -> Box<[u8]> {
    Box::new(self.state.to_be_bytes())
  }
}

#[derive(Debug, Clone)]
pub struct Fnv64A {
  state: u64,
}

impl BlockSizeUser for Fnv64A {
  type BlockSize = typenum::U1;
}

impl Default for Fnv64A {
  fn default() -> Fnv64A {
    Fnv64A::new()
  }
}

impl Fnv64A {
  pub fn new() -> Fnv64A {
    Fnv64A { state: BASIS_64 }
  }

  pub fn update(&mut self, bytes: impl AsRef<[u8]>) {
    for byte in bytes.as_ref() {
      self.state ^= u64::from(*byte);
      self.state = self.state.wrapping_mul(PRIME_64);
    }
  }

  pub fn digest(&self) -> Box<[u8]> {
    Box::new(self.state.to_be_bytes())
  }
}
