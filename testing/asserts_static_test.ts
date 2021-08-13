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
        import { assertStatic, TypeEquals, TypeExtends, TypeStrictlyExtends } from "./asserts_static.ts";
      ${code.trim()}
      `),
    );
    p.stdin.close();
    const output = await p.stderrOutput();
    p.close();
    const actualErrors = new TextDecoder().decode(output).replaceAll(
      /file:\/\/.*?\$deno\$stdin\.ts/g,
      "",
    );
    const normalize = (s: string) => s.trim().replace(/[ \t]*\n+[ \t]*/g, "\n");
    assertEquals(normalize(actualErrors), normalize(expectedErrors));
  };

Deno.test(
  "some successes",
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
  "some failures",
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
    at :3:20

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", string, " but actual type was ", "hello", ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<typeof x, string>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :5:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", 2, " but actual type was ", string | number, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<2 | (number | string), 2>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :6:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", "hello", " but actual type was ", 2, ". ", "Actual type is incompatible with expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<2, typeof x>>();
    ~~~~~~~~~~~~~~~~~~~~~~~
    at :7:18

    Found 4 errors.
    `,
  ),
);

Deno.test(
  "successful unions",
  () => {
    type zeroValues = never;
    type oneValue = zeroValues | "one";
    type twoValues = oneValue | "two";
    type threeValues = twoValues | "three";
    type infinityValues = threeValues | string;
    type infinitySquaredValues = infinityValues | bigint;

    // every type should equal itself
    assertStatic<TypeEquals<zeroValues, zeroValues>>();
    assertStatic<TypeEquals<oneValue, oneValue>>();
    assertStatic<TypeEquals<twoValues, twoValues>>();
    assertStatic<TypeEquals<threeValues, threeValues>>();
    assertStatic<TypeEquals<infinityValues, infinityValues>>();
    assertStatic<TypeEquals<infinitySquaredValues, infinitySquaredValues>>();

    // the empty type should extend/subset every type
    assertStatic<TypeExtends<zeroValues, zeroValues>>();
    assertStatic<TypeExtends<zeroValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<zeroValues, oneValue>>();
    assertStatic<TypeExtends<zeroValues, twoValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, twoValues>>();
    assertStatic<TypeExtends<zeroValues, threeValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, threeValues>>();
    assertStatic<TypeExtends<zeroValues, infinityValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, infinityValues>>();
    assertStatic<TypeExtends<zeroValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, infinitySquaredValues>>();

    // the next-smallest type should extend/subset every other type
    assertStatic<TypeExtends<oneValue, oneValue>>();
    assertStatic<TypeExtends<oneValue, twoValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, twoValues>>();
    assertStatic<TypeStrictlyExtends<twoValues, threeValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, threeValues>>();
    assertStatic<TypeExtends<oneValue, infinityValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, infinityValues>>();
    assertStatic<TypeExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeEquals<{ x: twoValues }, { x: twoValues }>>();
    assertStatic<TypeStrictlyExtends<{ x: twoValues }, { x: threeValues }>>();
    assertStatic<
      TypeStrictlyExtends<
        { x: twoValues; y: 2 },
        { x: twoValues }
      >
    >();
    assertStatic<TypeStrictlyExtends<{ x: oneValue }, { x: twoValues }>>();

    // our largest set should superset every type
    assertStatic<TypeExtends<zeroValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<zeroValues, infinitySquaredValues>>();
    assertStatic<TypeExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, infinitySquaredValues>>();
    assertStatic<TypeExtends<twoValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<twoValues, infinitySquaredValues>>();
    assertStatic<TypeExtends<infinityValues, infinitySquaredValues>>();
    assertStatic<TypeStrictlyExtends<infinityValues, infinitySquaredValues>>();
  },
);

Deno.test(
  "failed unions",
  typeErrorsTest(
    `
    type zeroValues = never;
    type oneValue = zeroValues | "one";
    type twoValues = oneValue | "two";
    type threeValues = twoValues | "three";
    type infinityValues = threeValues | string;
    type infinitySquaredValues = infinityValues | bigint;

    assertStatic<TypeEquals<zeroValues, oneValue>>();
    assertStatic<TypeEquals<oneValue, twoValues>>();
    assertStatic<TypeEquals<twoValues, threeValues>>();
    assertStatic<TypeEquals<threeValues, infinityValues>>();
    assertStatic<TypeEquals<infinityValues, infinitySquaredValues>>();
    assertStatic<TypeEquals<infinitySquaredValues, zeroValues>>();

    assertStatic<TypeStrictlyExtends<zeroValues, zeroValues>>();
    assertStatic<TypeExtends<oneValue, zeroValues>>();
    assertStatic<TypeStrictlyExtends<oneValue, zeroValues>>();
    assertStatic<TypeExtends<twoValues, zeroValues>>();
    assertStatic<TypeStrictlyExtends<twoValues, zeroValues>>();
    assertStatic<TypeExtends<threeValues, zeroValues>>();
    assertStatic<TypeStrictlyExtends<threeValues, zeroValues>>();
    assertStatic<TypeExtends<infinityValues, zeroValues>>();
    assertStatic<TypeStrictlyExtends<infinityValues, zeroValues>>();
    assertStatic<TypeExtends<infinitySquaredValues, zeroValues>>();
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, zeroValues>>();

    assertStatic<TypeExtends<twoValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<twoValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<threeValues, twoValues>>();
    assertStatic<TypeStrictlyExtends<threeValues, oneValue>>();
    assertStatic<TypeExtends<infinityValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<infinityValues, oneValue>>();
    assertStatic<TypeExtends<infinitySquaredValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, oneValue>>();

    assertStatic<TypeExtends<infinitySquaredValues, zeroValues>>();
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, zeroValues>>();
    assertStatic<TypeExtends<infinitySquaredValues, oneValue>>();
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, oneValue>>();
    assertStatic<TypeExtends<infinitySquaredValues, twoValues>>();
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, twoValues>>();
    assertStatic<TypeExtends<infinitySquaredValues, infinityValues>>();
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, infinityValues>>();
    `,
    `
    error: TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", "one", " but actual type was ", never, ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<zeroValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :10:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", twoValues, " but actual type was ", "one", ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<oneValue, twoValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :11:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", threeValues, " but actual type was ", twoValues, ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<twoValues, threeValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :12:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", string, " but actual type was ", threeValues, ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<threeValues, infinityValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :13:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", infinitySquaredValues, " but actual type was ", string, ". ", "Actual type is extended by/is a strict subset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<infinityValues, infinitySquaredValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :14:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to exactly match ", never, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeEquals<infinitySquaredValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :15:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", never, ". ", "Actual and expected types are identical."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<zeroValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :17:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", never, " but actual type was ", "one", ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<oneValue, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :18:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", "one", ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<oneValue, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :19:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", never, " but actual type was ", twoValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<twoValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :20:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", twoValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<twoValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :21:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", never, " but actual type was ", threeValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<threeValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :22:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", threeValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<threeValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :23:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", never, " but actual type was ", string, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinityValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :24:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", string, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinityValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :25:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", never, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinitySquaredValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :26:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :27:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", "one", " but actual type was ", twoValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<twoValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :29:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", "one", " but actual type was ", twoValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<twoValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :30:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", twoValues, " but actual type was ", threeValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<threeValues, twoValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :31:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", "one", " but actual type was ", threeValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<threeValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :32:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", "one", " but actual type was ", string, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinityValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :33:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", "one", " but actual type was ", string, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinityValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :34:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", "one", " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinitySquaredValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :35:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", "one", " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :36:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", never, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinitySquaredValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :38:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", never, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, zeroValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :39:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", "one", " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinitySquaredValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :40:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", "one", " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, oneValue>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :41:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", twoValues, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinitySquaredValues, twoValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :42:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", twoValues, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, twoValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :43:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to extend or match ", string, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeExtends<infinitySquaredValues, infinityValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :44:18

    TS2344 [ERROR]: Type 'StaticFailure<["Expected type to strictly extend ", string, " but actual type was ", infinitySquaredValues, ". ", "Actual type extends/is a strict superset of expected type."]>' does not satisfy the constraint '"Pass"'.
    assertStatic<TypeStrictlyExtends<infinitySquaredValues, infinityValues>>();
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    at :45:18

    Found 33 errors.
    `,
  ),
);

let _x = [
  [
    `assertStatic<TypeEquals<2, 3>>()`,
    `["Expected type to exactly match ", "hello", " but actual type was ", 2, ". ", "Actual type is incompatible with expected type."]`,
  ],
];
