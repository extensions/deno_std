export type Pass = "static assertions must pass";
export type Failure<Message> = [Message];

export const assertStatic = <Assertion extends Pass>() => undefined;
export type AssertStatic<Assertion extends Pass> = undefined;

type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | undefined
  | null
  | void;

type DeepReplaceAny<T> = ExactType<Omicron> extends ExactType<Aleph & T> ? Any
  : T extends Primitive ? T
  : OnlyDeepReplaceAny<T>;
// XXX: Does this lose type information about functions that are both callable
// and have properties, or does TypeScript handle that implicitly?
type OnlyDeepReplaceAny<T> = T extends (...args: infer A) => infer R
  ? (...args: OnlyDeepReplaceAny<A>) => DeepReplaceAny<R>
  : {
    [P in keyof T]: DeepReplaceAny<T[P]>;
  };
enum Any {
  _ = "",
}

// Unique sentinel types used for type comparisons.
enum Aleph {
  _ = "",
}
enum Omicron {
  _ = "",
}

export type TypeEquals<Actual, Expected> = TypeEqualsHelper<
  Actual,
  DeepReplaceAny<Actual>,
  Expected,
  DeepReplaceAny<Expected>
>;

type TypeEqualsHelper<
  Actual,
  ActualReplacedAny,
  Expected,
  ExpectedReplacedAny,
> = ExactType<Expected> extends ExactType<Actual> ? (
  Pass
)
  : (
    Failure<[
      DontDistribute<ExpectedReplacedAny> extends
        DontDistribute<ActualReplacedAny>
        ? DontDistribute<ActualReplacedAny> extends
          DontDistribute<ExpectedReplacedAny>
          ? "Internal assert_static error: this should be unreachable!"
        : "Expected types to be identical, but the expected type extends the actual type."
        : DontDistribute<ActualReplacedAny> extends
          DontDistribute<ExpectedReplacedAny>
          ? "Expected types to be identical, but the actual type extends the expected type."
        : "Expected types to be identical, but they were unrelated.",
      { Actual: Actual; Expected: Expected },
    ]>
  );

// Use on both sides of an `extends` to make it an exact comparison
type ExactType<T> = (_: T) => T;

// Use on both sides of an `extends` to ensure it produces a single result
// for union types, instead of distributing across them.
type DontDistribute<T> = () => T;
