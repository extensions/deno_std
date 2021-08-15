import { assertStatic, TypeEquals } from "./asserts_static.ts";
import { assertEquals } from "./asserts.ts";
import { writeAll } from "../io/util.ts";
import { dirname, fromFileUrl } from "../path/mod.ts";

const moduleDir = dirname(fromFileUrl(import.meta.url));

// SUB-TASK:
// implement that nice system for testing type errors!

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
    assertStatic<TypeEquals<2, 2 & number>>();
    assertStatic<TypeEquals<3 & (number | string), 2>>();
    const x = "hello";
    assertStatic<TypeEquals<typeof x, "sfage">>();
    assertStatic<TypeEquals<"hello", "hello">>();
  },
);

// TODO: test nested any etc.
