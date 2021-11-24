import { _assertTypescriptErrors } from "./asserts.ts";
import { assertStatic, TypeEquals } from "./asserts_static.ts";
Deno.test(
  "assertStatic/TypeEquals/success",
  () => {
    assertStatic<TypeEquals<unknown, unknown>>();
    assertStatic<TypeEquals<any, any>>();
    assertStatic<TypeEquals<number, number>>();
    assertStatic<TypeEquals<number, number | 3>>();
    assertStatic<TypeEquals<number, number & (number | string)>>();
    assertStatic<TypeEquals<{ new (): void }, { new (): void }>>();
    assertStatic<TypeEquals<Promise<number>, Promise<number>>>();
    assertStatic<TypeEquals<PromiseLike<number>, PromiseLike<number>>>();
    assertStatic<TypeEquals<[number, any], [number, any]>>();
    assertStatic<
      TypeEquals<[{ f(_: number): void }], [{ f(_: number): void }]>
    >();
    assertStatic<
      TypeEquals<[{ f(): number }], unknown & [{ f(): number }]>
    >();
    assertStatic<
      TypeEquals<[{ f?(): number }], [{ f?(): number }]>
    >();

    assertStatic<
      TypeEquals<{}, {}>
    >();

    assertStatic<
      TypeEquals<{ a: 1 }, { a: 1 }>
    >();

    assertStatic<
      TypeEquals<{ (b: number): number }, { (a: number): number }>
    >();

    // expected errors:

    assertStatic<
      TypeEquals<
        { (a: number, b?: number): number },
        { (a: number): number }
      >
    >();

    assertStatic<
      TypeEquals<
        { (a: number, b: number): number },
        { (a: number, ...args: number[]): number }
      >
    >();

    assertStatic<TypeEquals<any[], number[]>>();

    assertStatic<TypeEquals<[any[]], [number[]]>>();

    assertStatic<TypeEquals<[...any[]], [...number[]]>>();

    assertStatic<TypeEquals<[number, ...any[]], [number, ...number[]]>>();

    assertStatic<
      TypeEquals<
        { (a: number, ...b: number[]): number },
        { (a: number): void }
      >
    >();

    assertStatic<
      TypeEquals<{ (): number; a: 1 }, { (): number; a: 2 }>
    >();

    assertStatic<
      TypeEquals<{ (): number }, { (a: number): number }>
    >();

    assertStatic<
      TypeEquals<{ (): number }, { (): number; b: 2 }>
    >();

    assertStatic<
      TypeEquals<{ (): number }, { (a: number): number }>
    >();

    assertStatic<
      TypeEquals<{ new (x: number): void }, { new (x: string): void }>
    >();

    assertStatic<TypeEquals<number, number | string>>();
  },
);

// type t1 = (a: number, ...b: number[]) => number;
// type t2 = (a: number, b: number) => number;

// let t1_a = (undefined as unknown) as t1;
// let t2_a = (undefined as unknown) as t2;

// // Mutually assignable!
// // Even with strict
// let t1_b: t1 = t2_a;
// let t2_b: t2 = t1_a;

Deno.test(
  "assertStatic/TypeEquals/failure",
  async () => {
    await _assertTypescriptErrors(import.meta, (ts) =>
      ts`
      import { assertStatic, TypeEquals } from "./asserts_static.ts";

      assertStatic<TypeEquals<unknown, unknown>>();
      ${null}

      assertStatic<TypeEquals<any, any>>();
      ${null}

      assertStatic<TypeEquals<number, number>>();
      ${null}

      assertStatic<TypeEquals<2, 2>>();
      ${null}

      assertStatic<TypeEquals<any, unknown>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Actual type was any, but expected type was not.", { Actual: any; Expected: unknown; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<unknown, any>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected type was any, but actual type was not.", { Actual: unknown; Expected: any; }]>' does not satisfy the constraint '"static assertions must pass"'.`}
      assertStatic<TypeEquals<number, unknown>>();

      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: number; Expected: unknown; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<unknown, number>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: unknown; Expected: number; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<any, number>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Actual type was any, but expected type was not.", { Actual: any; Expected: number; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<number, any>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected type was any, but actual type was not.", { Actual: number; Expected: any; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<2, number>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: 2; Expected: number; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<number, 2>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: number; Expected: 2; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<3, 2>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but they were unrelated.", { Actual: 3; Expected: 2; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<2 | 3, 2>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: 2 | 3; Expected: 2; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<2, 2 | 3>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: 2; Expected: 2 | 3; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<2 | "three", 2>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: 2 | "three"; Expected: 2; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<2, 2 | "three">>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: 2; Expected: 2 | "three"; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<[number, unknown], [number, unknown]>>();
      ${null}

      assertStatic<TypeEquals<[number, unknown], [number, number]>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: [number, unknown]; Expected: [number, number]; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<[number, unknown], [unknown, unknown]>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: [number, unknown]; Expected: [unknown, unknown]; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<[number, unknown], [number]>>();
      ${` TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but they were unrelated.", { Actual: [number, unknown]; Expected: [number]; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<[number, unknown], [unknown]>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but they were unrelated.", { Actual: [number, unknown]; Expected: [unknown]; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<{ a: "one"; b: 2 }, { a: "one"; b: 2 }>>();
      ${null}

      assertStatic<TypeEquals<{ a: number; b: unknown }, { a: number }>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: { a: number; b: unknown; }; Expected: { a: number; }; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<{ a: number; b: unknown }, { a: number; b: number }>>();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: { a: number; b: unknown; }; Expected: { a: number; b: number; }; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<TypeEquals<{ a: unknown; b: unknown }, { a: unknown; b: unknown }>>();
      ${null}

      assertStatic<TypeEquals<[number, any], [number, number]>>();
      ${null}

      assertStatic<TypeEquals<[{ f(_: any): void }], [{ f(_: number): void }]>>();
      ${null}

      assertStatic<TypeEquals<[{ f(_: number): any }], [{ f(_: number): void }]>>();
      ${null}

      assertStatic<TypeEquals<[{ f(): any }], [{ f(): number }]>>();
      ${null}

      assertStatic<TypeEquals<[{ f?(): number }], [{ f(): number }]>>();
      ${null}

      assertStatic<TypeEquals<PromiseLike<number>, Promise<number>>>();
      ${null}

      assertStatic<TypeEquals<{ a: 1; b: 2 }, { a: 1 }>>();
      ${null}
  `);
  },
);
