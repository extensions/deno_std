/** type returned by successful static assertions */
export type Pass = "static assertions must pass";
/** type returned by failed static assertions */
export type Failure<Message> = [Message];

/** static assertion as a no-op function call. */
export const assertStatic = <Assertion extends Pass>() => undefined;
/** static assertion as a dummy undefined type. */
export type AssertStatic<Assertion extends Pass> = undefined;

/**
 * Asserts that two types are mutually-assignable without a TypeScript type error.
 *
 * This doesn't neccessarily mean that the types are entirely identical. In the
 * following example, these function signatures are meaningfully different, but
 * TypeScript allows values of one to be assigned to variable of the other type.
 * This assertion will also consider them to be "equal", and won't fail. The
 * `any` type is also consider "equal" to any other type.
 *
 * ```ts
 * type t1 = (a: number, ...b: number[]) => number;
 * type t2 = (a: number, b: number) => number;
 *
 * let t1_a: t1 = (a: number, ...b: number[]) => a + b.length;
 * let t2_a: t2 = (a:number, b: number) => a + b;
 *
 * let t1_b: t1 = t2_a;
 * let t2_b: t2 = t1_a;
 * ```
 */
export type TypeEquals<Actual, Expected> = TypeEqualsHelper<
  Actual,
  Actual,
  Expected,
  Expected
>;

enum UniqueTypeA {
  _ = "",
}
enum UniqueTypeB {
  _ = "",
}

type IsAny<Type> = MutuallyAssignable<UniqueTypeA> extends
  MutuallyAssignable<UniqueTypeB & Type> ? true : false;

/**
 * Asserts that a type does not contain a property with the `any` type anywhere
 * in its definition, recursively. This does not consider the argument or
 * return types of functions or constructors. Array entries are checked instead
 * of properties.
 */
export type ForbidAny<Type> = ContainsAny<Type> extends false ? Pass
  : Failure<[
    "Expected type not to contain any properties with `any` type, but it contained some.",
    { Type: Type; Where: ContainsAny<Type> },
  ]>;

type ContainsAny<Type, Path extends any[] = []> = IsAny<Type> extends false
  ? Type extends Primitive ? false
  : Type extends Array<infer Item> ? ContainsAny<Item, [...Path, number]>
  : {
    [property in keyof Type]: Type[property] extends Function ? never
      : FalseNever<ContainsAny<Type[property], [...Path, property]>>;
  }[keyof Type]
  : Path;

type FalseNever<T> = T extends false ? never : T;

assertStatic<
  ForbidAny<{
    a: [2, 3, 3];
    b: 2;
    c: 4;
  }>
>();

type TypeEqualsHelper<
  Actual,
  ActualToCompare,
  Expected,
  ExpectedToCompare,
> = MutuallyAssignable<Expected> extends MutuallyAssignable<Actual> ? (
  Pass
)
  : (
    Failure<[
      DontDistribute<ExpectedToCompare> extends DontDistribute<ActualToCompare>
        ? DontDistribute<ActualToCompare> extends
          DontDistribute<ExpectedToCompare>
          ? "Expected types to be identical, but they have a weird relationship that assert_static doesn't understand (this is a bug)."
        : "Expected types to be identical, but the expected type extends the actual type."
        : DontDistribute<ActualToCompare> extends
          DontDistribute<ExpectedToCompare>
          ? "Expected types to be identical, but the actual type extends the expected type."
        : "Expected types to be identical, but they were unrelated.",
      {
        // Actual: Actual;
        // Expected: Expected;
        ActualToCompare: ActualToCompare;
        ExpectedToCompare: ExpectedToCompare;
      },
    ]>
  );

// Type variance magic I don't fully understand.
type MutuallyAssignable<T> = (_: T) => T;
type DontDistribute<T> = (_: T) => void;

type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | undefined
  | null
  | void;

// Maybe we want this capability, but for the common case we shouldn't need it.

// Simplify a type, to make them easier to compare.
type DeepSimplify<T> = DeepSimplify_1_Any<T>;

// Replace `any` with our `Any` type.
type DeepSimplify_1_Any<T> = MutuallyAssignable<UniqueTypeB> extends
  MutuallyAssignable<UniqueTypeA & T> ? Any
  : DeepSimplify_2_Unknown<T>;
enum Any {
  _ = "",
}

// Replace `unknown` with our `Unknown` type.
type DeepSimplify_2_Unknown<T> = MutuallyAssignable<UniqueTypeA> extends
  MutuallyAssignable<UniqueTypeA | T> ? Unknown
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
const Array_: unique symbol = Symbol("Array");
type Array_ = typeof Array_;
type DeepSimplify_6_Array<T> = T extends (infer I)[]
  ? { [Array_]: DeepSimplify<I> } & DeepSimplify_7_Object<T>
  : DeepSimplify_7_Object<T>;

// Recur through arrays and objects.
type DeepSimplify_7_Object<T> = T extends Record<infer P, infer V> ? {
  [p in P]: DeepSimplify<T[p]>;
}
  : {};
