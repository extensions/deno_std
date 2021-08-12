import {
  assertStatic,
  TypeEquals,
  TypeExtends,
  TypeStrictlyExtends,
} from "./asserts_static.ts";
import { assertEquals } from "./asserts.ts";
import { writeAll } from "../io/util.ts";
import { dirname, fromFileUrl } from "../path/mod.ts";

const moduleDir = dirname(fromFileUrl(import.meta.url));

const typeErrorsTest = (code: string, expectedErrors: string) =>
  async () => {
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
      new TextEncoder().encode(`
        import { assertStatic, TypeEquals, TypeExtends, TypeStrictlyExtends } from "./asserts_static.ts;";
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

Deno.test(
  "passing",
  () => {
    assertStatic<"Pass">();
    assertStatic<TypeEquals<2, 2 & number>>();
    assertStatic<TypeExtends<2, 2>>();
    assertStatic<TypeExtends<2, number>>();
    assertStatic<TypeStrictlyExtends<2, number>>();
    assertStatic<TypeEquals<2 & (number | string), 2>>();
    const x = "hello";
    assertStatic<TypeEquals<typeof x, "hello">>();
    assertStatic<TypeEquals<"hello", "hello">>();
  },
);

Deno.test(
  "failing",
  typeErrorsTest(
    `
    assertStatic<TypeEquals<2, number>>();
    const x = "hello";
    assertStatic<TypeEquals<typeof x, string>>();
    assertStatic<TypeEquals<2 | (number | string), 2>>();
    assertStatic<TypeEquals<2, typeof x>>();
    `,
    `
    error: TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", number, " but actual type was ", 2, ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<2, number>>();
    ~~~~~~~~~~~~~~~~~~~~~
    at file://./$deno$stdin.ts:3:18
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
  ),
);

Deno.test(
  "unions",
  () => {
    type zeroValues = never;
    type oneValue = zeroValues | "one";
    type twoValues = oneValue | "two";
    type infinityValues = twoValues | string;
    type infinitySquaredValues = infinityValues | bigint;

    // every type should equal itself
    assertStatic<TypeEquals<zeroValues, zeroValues>>();
    assertStatic<TypeEquals<oneValue, oneValue>>();
    assertStatic<TypeEquals<twoValues, twoValues>>();
    assertStatic<TypeEquals<infinityValues, infinityValues>>();
    assertStatic<TypeEquals<infinitySquaredValues, infinitySquaredValues>>();

    // the empty type should extend/subset every type
    assertStatic<TypeExtends<zeroValues, zeroValues>>();
    assertStatic<TypeExtends<zeroValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<zeroValues, oneValue>>();
    assertStatic<TypeExtends<zeroValues, twoValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, twoValues>>();
    assertStatic<TypeExtends<zeroValues, infinityValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, infinityValues>>();
    assertStatic<TypeExtends<zeroValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, infinitySquaredValues>>();

    // the next-smallest type should extend/subset every other type
    assertStatic<TypeExtends<oneValue, oneValue>>();
    assertStatic<TypeExtends<oneValue, twoValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, twoValues>>();
    assertStatic<TypeExtends<oneValue, infinityValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, infinityValues>>();
    assertStatic<TypeExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, infinitySquaredValues>>();

    // our largest set should superset every type
    assertStatic<TypeExtends<zeroValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, infinitySquaredValues>>();
    assertStatic<TypeExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeExtends<twoValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<twoValues, infinitySquaredValues>>();
    assertStatic<TypeExtends<infinityValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<infinityValues, infinitySquaredValues>>();
    assertStatic<TypeExtends<infinitySquaredValues, infinitySquaredValues>>();
  },
);
