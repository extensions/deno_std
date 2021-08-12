import { assertEquals } from "./asserts.ts";
import { writeAll } from "../io/util.ts";
import { dirname, fromFileUrl } from "../path/mod.ts";

const moduleDir = dirname(fromFileUrl(import.meta.url));
const assertTypeErrors = async (code: string, expectedErrors: string) => {
  const p = Deno.run({
    cmd: [
      Deno.execPath(),
      "run",
      "--quiet",
      "-",
    ],
    env: {
      "NO_COLOR": "NO_COLOR",
    },
    cwd: moduleDir,
    stdin: "piped",
    stdout: "null",
    stderr: "piped",
  });

  await writeAll(
    p.stdin,
    new TextEncoder().encode(`import {
      assertStatic, TypeEquals, TypeExtends, TypeStrictlyExtends } from "./asserts_static.ts";
    ${code.trim()}
  `),
  );
  p.stdin.close();
  const output = await p.stderrOutput();
  p.close();
  const actualErrors = new TextDecoder().decode(output).replaceAll(
    `${moduleDir}`,
    ".",
  );
  const normalize = (s: string) => s.trim().replace(/[ \t]*\n+[ \t]*/g, "\n");
  assertEquals(normalize(actualErrors), normalize(expectedErrors));
};

Deno.test("passing", async () => {
  await assertTypeErrors(
    `
      assertStatic<"Pass">();
    `,
    ``,
  );

  await assertTypeErrors(
    `
      assertStatic<TypeEquals<2, 2 & number>>();
      assertStatic<TypeExtends<2, 2>>();
      assertStatic<TypeExtends<2, number>>();
      assertStatic<TypeStrictlyExtends<2, number>>();
      assertStatic<TypeEquals<2 & (number | string), 2>>()
      const x = "hello";
      assertStatic<TypeEquals<typeof x, "hello">>();
      assertStatic<TypeEquals<"hello", "hello">>();
    `,
    ``,
  );
});

Deno.test("failing", async () => {
  await assertTypeErrors(
    `
      assertStatic<TypeEquals<2, number>>();
    `,
    `
      error: TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", number, " but actual type was ", 2, ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
      assertStatic<TypeEquals<2, number>>();
      ~~~~~~~~~~~~~~~~~~~~~
      at file://./$deno$stdin.ts:3:18
    `,
  );

  await assertTypeErrors(
    `
      const x = "hello";
      assertStatic<TypeEquals<typeof x, string>>();
      assertStatic<TypeEquals<2 | (number | string), 2>>();
      assertStatic<TypeEquals<2, typeof x>>();
    `,
    `
      error: TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", string, " but actual type was ", "hello", ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
      assertStatic<TypeEquals<typeof x, string>>();
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      at file://./$deno$stdin.ts:4:20

      TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", 2, " but actual type was ", string | number, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
      assertStatic<TypeEquals<2 | (number | string), 2>>();
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      at file://./$deno$stdin.ts:5:20

      TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", "hello", " but actual type was ", 2, ". ", "Actual type is unrelated to expected type."]>' does not satisfy the constraint '"Pass"'.
      assertStatic<TypeEquals<2, typeof x>>();
      ~~~~~~~~~~~~~~~~~~~~~~~
      at file://./$deno$stdin.ts:6:20

      Found 3 errors.
    `,
  );
});

Deno.test("extending with unions", async () => {
  await assertTypeErrors(
    `
      assertStatic<TypeEquals<"hello" | "goodbye", "hello">>();
      assertStatic<TypeExtends<"hello" | "goodbye", "hello">>();
      assertStatic<TypeStrictlyExtends<"hello" | "goodbye", "hello">>();
    `,
    ``,
  );
});

Deno.test("extending from unions", async () => {
  await assertTypeErrors(
    `
      assertStatic<TypeEquals<"hello", "hello" | "goodbye">>();
      assertStatic<TypeExtends<"hello", "hello" | "goodbye">>();
      assertStatic<TypeStrictlyExtends<"hello", "hello" | "goodbye">>();
    `,
    ``,
  );
});
