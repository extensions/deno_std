import { assertStatic, TypeEquals } from "./asserts_static.ts";
import { dirname, fromFileUrl } from "../path/mod.ts";
import { _assertTypescriptErrors } from "../../../x/deno_std/testing/asserts.ts";

const moduleDir = dirname(fromFileUrl(import.meta.url));

type x = (2 & any) extends 2 ? "t" : "f";

Deno.test(
  "assertStatic/TypeEquals/success",
  () => {
    assertStatic<TypeEquals<any, 2>>();
    assertStatic<TypeEquals<2, any>>();
    assertStatic<TypeEquals<2 & (number | string), 2>>();
    const x = "hello";
    assertStatic<TypeEquals<typeof x, "nope">>();
    assertStatic<TypeEquals<"hello", "hello">>();
  },
);

Deno.test(
  "assertStatic/TypeEquals/failure",
  async () => {
    await _assertTypescriptErrors(import.meta, (ts) =>
      ts`
      import { assertStatic, TypeEquals } from "./asserts_static.ts";

      assertStatic<TypeEquals<2, 2 & number>>();
      assertStatic<TypeEquals<3 & (number | string), 2>>();
      ${`
        TS2344 [ERROR]: Type 'Failure<["Expected left type to exactly match right type ", 2, " but left type was ", 3, ". "]>' does not satisfy the constraint '"static assertions must pass"'.
      `}
      const x = "hello";
      assertStatic<TypeEquals<typeof x, "goodbye">>();
      ${`
        TS2344 [ERROR]: Type 'Failure<["Expected left type to exactly match right type ", "goodbye", " but left type was ", "hello", ". "]>' does not satisfy the constraint '"static assertions must pass"'.
      `}
      assertStatic<TypeEquals<"hello", "hello">>();
  `);
  },
);

// TODO: test nested any etc.
