export type Pass = "static assertions must pass";
export type Failure<Message> = [Message];

export const assertStatic = <Assertion extends Pass>() => undefined;
export type AssertStatic<Assertion extends Pass> = undefined;

// Unique sentinel types used for type comparisons.

const Aleph = Symbol();
type Aleph = typeof Aleph;
const Omicron = Symbol();
type Omicron = typeof Omicron;

// Use on both sides of an `extends` to make it an exact comparison
type ExactType<T> = (_: T) => T;

// Use on both sides of an `extends` to ensure it produces a single result
// for union types, instead of distributing across them.
type DontDistribute<T> = () => T;

export type TypeEquals<Actual, Expected> =
  // if actual is any
  ExactType<Omicron> extends ExactType<Aleph & Actual> ? (
    // if expected is any
    ExactType<Omicron> extends ExactType<Aleph & Expected> ? (
      Pass
    )
      : // else (expected is not any)
      (
        Failure<
          [
            "Actual type was any, but expected type was not.",
            { Actual: Actual; Expected: Expected },
          ]
        >
      )
  )
    : // else (actual is not any)
    (
      // if expected is any
      ExactType<Omicron> extends ExactType<Expected & Aleph> ? (
        Failure<
          [
            "Expected type was any, but actual type was not.",
            { Actual: Actual; Expected: Expected },
          ]
        >
      )
        : // else (expected is not any)
        (
          // if actual is never
          ExactType<Aleph> extends ExactType<Aleph | Actual> ? (
            // if expected is never
            ExactType<Aleph> extends ExactType<Aleph | Expected> ? (
              Pass
            )
              : // else (expected is not never)
              (
                Failure<
                  [
                    "Actual type was never, but expected type was not.",
                    { Actual: Actual; Expected: Expected },
                  ]
                >
              )
          )
            : // else (actual is not never)
            (
              // if expected is never
              ExactType<Aleph> extends ExactType<Aleph | Expected> ? (
                Failure<
                  [
                    "Expected type was never, but actual type was not.",
                    { Actual: Actual; Expected: Expected },
                  ]
                >
              )
                : // else (expected is not never)
                (
                  // if expected and actual are the same type
                  ExactType<Expected> extends ExactType<Actual> ? (
                    Pass
                  )
                    : (
                      Failure<[
                        DontDistribute<Expected> extends DontDistribute<Actual>
                          ? DontDistribute<Actual> extends
                            DontDistribute<Expected>
                            ? "Expected types to be identical, but DOES NOT COMPUTE?"
                          : "Expected types to be identical, but the expected type extends the actual type."
                          : DontDistribute<Actual> extends
                            DontDistribute<Expected>
                            ? "Expected types to be identical, but the actual type extends the expected type."
                          : "Expected types to be identical, but they were unrelated.",
                        { Actual: Actual; Expected: Expected },
                      ]>
                    )
                )
            )
        )
    );
