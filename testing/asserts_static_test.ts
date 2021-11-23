import { _assertTypescriptErrors } from "./asserts.ts";
import { assertStatic, TypeEquals } from "./asserts_static.ts";

Deno.test(
  "assertStatic/TypeEquals/success",
  () => {
    assertStatic<TypeEquals<unknown, unknown>>();
    assertStatic<TypeEquals<any, any>>();
    assertStatic<TypeEquals<number, number>>();

    // XXX: problem!
    // this should be an error, but it isn't?
    // maybe we have to do a deep replace-all of `any` with something else
    // https://github.com/Shopify/quilt/blob/@shopify/useful-types@2.4.0/packages/useful-types/src/types.ts#L26
    assertStatic<TypeEquals<[number, any], [number, number]>>();
  },
);

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

      assertStatic<
        TypeEquals<{ a: "one"; b: 2 }, { a: "one"; b: 2 }>
      >();
      ${null}

      assertStatic<
        TypeEquals<{ a: number; b: unknown }, { a: number }>
      >();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the actual type extends the expected type.", { Actual: { a: number; b: unknown; }; Expected: { a: number; }; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<
        TypeEquals<{ a: number; b: unknown }, { a: number; b: number }>
      >();
      ${`TS2344 [ERROR]: Type 'Failure<["Expected types to be identical, but the expected type extends the actual type.", { Actual: { a: number; b: unknown; }; Expected: { a: number; b: number; }; }]>' does not satisfy the constraint '"static assertions must pass"'.`}

      assertStatic<
        TypeEquals<{ a: number; b: unknown }, { a: unknown; b: unknown }>
      >();
      ${`XXX: problem! this should pass!`}
  `);
  },
);
