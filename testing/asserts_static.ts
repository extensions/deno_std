/**
 * Ensures that a static assertion is upheld, or triggers a type error.
 *
 * This is a no-op at runtime; it's only meaningful during type checking.
 */
export const assertStatic = <_ extends Pass>() => undefined;

export type TypeEquals<Actual, Expected> =
  TypeRelation<Actual, Expected> extends Identical ? Pass
    : StaticFailure<[
      "Expected type to exactly match ",
      Expected,
      " but actual type was ",
      Actual,
      ". ",
      TypeRelation<Actual, Expected>,
    ]>;

export type TypeExtends<Actual, Expected> =
  TypeRelation<Actual, Expected> extends (Identical | ActualIsSubsetOfExpected)
    ? Pass
    : StaticFailure<[
      "Expected type to extend ",
      Expected,
      " but actual type was ",
      Actual,
      ". ",
      TypeRelation<Actual, Expected>,
    ]>;

export type TypeStrictlyExtends<Actual, Expected> =
  TypeRelation<Actual, Expected> extends ActualIsSubsetOfExpected ? Pass
    : StaticFailure<[
      "Expected type to strictly extend ",
      Expected,
      " but actual type was ",
      Actual,
      ". ",
      TypeRelation<Actual, Expected>,
    ]>;

/**
 * Returns a string constant type indicating the relationship between the
 * given two types.
 */
// deno-fmt-ignore
export type TypeRelation<Actual, Expected> =
  Nonce extends Actual & Dunce
  ? Nonce extends Expected & Dunce
    ? Identical // both are `any`
    : Unrelated // Actual is `any`
  : Nonce extends Expected & Dunce
    ? Unrelated // Expected is `any`
    : // neither are `any`
  Actual | Nonce extends Nonce
  ? Expected | Nonce extends Nonce
    ? Pass // both are `never`
    : ActualIsSubsetOfExpected // Actual is `never`
  : Expected | Nonce extends Nonce
    ? ActualIsSupersetOfExpected // Expected is `never`
    : // neither are `never`
  Expected extends Actual
    ? Actual extends Expected
      ? Identical
      : ActualIsSupersetOfExpected
    : Actual extends Expected
      ? ActualIsSubsetOfExpected
      : Unrelated;

// Possible relationships between two types, "Actual" and "Expected".
//
// The values are used in error messages when type assertions fail.
//
// Point of possible confusion: when you `extend` a type it might sound like you
// are expanding the set of possible values and creating a superset, but you are
// actually creating a subset because you add additional constraints.
type Identical = "Actual and expected types are identical.";
type ActualIsSupersetOfExpected =
  "Actual type extends/is a strict superset of expected type.";
type ActualIsSubsetOfExpected =
  "Actual type is extended by/is a strict subset of expected type.";
type Unrelated = "Actual type is unrelated to expected type.";

type Pass = "Pass";
type StaticFailure<Message> = [Message];

// Two unique dummy types used to simplify some comparisons.
const Nonce = Symbol();
const Dunce = Symbol();
type Nonce = typeof Nonce;
type Dunce = typeof Dunce;
