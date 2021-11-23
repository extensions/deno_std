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

// Simplify a type, to make them easier to compare.
type DeepSimplify<T> = DeepSimplify_1_Any<T>;
enum Aleph {
  _ = "",
}
enum Omicron {
  _ = "",
}

// Replace `any` with our `Any` type.
type DeepSimplify_1_Any<T> = AsArgAndReturn<Omicron> extends
  AsArgAndReturn<Aleph & T> ? Any
  : DeepSimplify_2_Unknown<T>;
enum Any {
  _ = "",
}

// Replace `any` with our `Unknown` type.
type DeepSimplify_2_Unknown<T> = AsArgAndReturn<Aleph> extends
  AsArgAndReturn<Aleph | T> ? Unknown
  : DeepSimplify_3_Primitive<T>;
enum Unknown {
  _ = "",
}

// Leave primitives alone.
type DeepSimplify_3_Primitive<T> = T extends Primitive ? T
  : DeepSimplify_4_Callable<T>;

// Extract function signatures.
const Args: unique symbol = Symbol("Args");
type Args = typeof Args;
const Return: unique symbol = Symbol("Return");
type Return = typeof Return;
type DeepSimplify_4_Callable<T> = T extends (...args: infer A) => infer R ? ({
  [Args]: DeepSimplify_6_Array<A>;
  [Return]: DeepSimplify<R>;
} & DeepSimplify_5_Constructable<T>)
  : DeepSimplify_5_Constructable<T>;

// Extract constructors.
const NewArgs: unique symbol = Symbol("NewArgs");
type NewArgs = typeof NewArgs;
const NewReturn: unique symbol = Symbol("NewReturn");
type NewReturn = typeof NewReturn;
type DeepSimplify_5_Constructable<T> = T extends
  { new (...args: infer A): infer R } ? {
  [NewArgs]: DeepSimplify_6_Array<A>;
  [NewReturn]: DeepSimplify<R>;
} & DeepSimplify_6_Array<T>
  : DeepSimplify_6_Array<T>;

// Extract array type.
const Array: unique symbol = Symbol("Array");
type Array = typeof Array;
type DeepSimplify_6_Array<T> = T extends (infer I)[]
  ? { [Array]: DeepSimplify<I> } & DeepSimplify_7_Object<T>
  : DeepSimplify_7_Object<T>;

// Recur through arrays and objects.
type DeepSimplify_7_Object<T> = {
  [P in keyof T]: DeepSimplify<T[P]>;
};

export type TypeEquals<Actual, Expected> = TypeEqualsHelper<
  Actual,
  DeepSimplify<Actual>,
  Expected,
  DeepSimplify<Expected>
>;

type TypeEqualsHelper<
  Actual,
  ActualSimplified,
  Expected,
  ExpectedSimplified,
> = AsArgAndReturn<Expected> extends AsArgAndReturn<Actual> ? (
  Pass
)
  : (
    Failure<[
      DontDistribute<ExpectedSimplified> extends
        DontDistribute<ActualSimplified>
        ? DontDistribute<ActualSimplified> extends
          DontDistribute<ExpectedSimplified>
          ? "Expected types to be identical, but they have a weird relationship that assert_static doesn't understand (this is a bug)."
        : "Expected types to be identical, but the expected type extends the actual type."
        : DontDistribute<ActualSimplified> extends
          DontDistribute<ExpectedSimplified>
          ? "Expected types to be identical, but the actual type extends the expected type."
        : "Expected types to be identical, but they were unrelated.",
      {
        Actual: Actual;
        Expected: Expected;
        ActualSimplified: ActualSimplified;
        ExpectedSimplified: ExpectedSimplified;
      },
    ]>
  );

// Type variance magic I don't fully understand.
type AsArgAndReturn<T> = (_: T) => T;
type AsArg<T> = (_: T) => void;
type AsReturn<T> = () => T;

// Used on both sides of an `extends` to ensure it produces a single result
// for union types, instead of distributing across them.
type DontDistribute<T> = AsArg<T>;
