/**
 * Ensures that a static assertion is upheld, or triggers a type error.
 *
 * This is a no-op at runtime; it's only meaningful during type checking.
 */
export const assertStatic = <_ extends Pass>() => undefined;

export type TypeEquals<Actual, Expected> = Assert<
  ExtendsAnyOf<
    TypeRelation<Actual, Expected>,
    [Identical]
  >,
  [
    "Expected type to exactly match ",
    Expected,
    " but actual type was ",
    Actual,
    ". ",
    TypeRelation<Actual, Expected>,
  ]
>;

export type TypeExtends<Actual, Expected> = Assert<
  ExtendsAnyOf<
    TypeRelation<Actual, Expected>,
    [Identical, ActualIsSubsetOfExpected]
  >,
  [
    "Expected type to extend or match ",
    Expected,
    " but actual type was ",
    Actual,
    ". ",
    TypeRelation<Actual, Expected>,
  ]
>;

export type TypeStrictlyExtends<Actual, Expected> = Assert<
  ExtendsAnyOf<
    TypeRelation<Actual, Expected>,
    [ActualIsSubsetOfExpected]
  >,
  [
    "Expected type to strictly extend ",
    Expected,
    " but actual type was ",
    Actual,
    ". ",
    TypeRelation<Actual, Expected>,
  ]
>;

type Assert<Condition extends Bool, FailureMessage> = IfThenElse<
  Condition,
  Pass,
  StaticFailure<FailureMessage>
>;

const True = Symbol();
type True = typeof True;
const False = Symbol();
type False = typeof False;
type Bool = True | False;

type Extends<left, right> = left extends right ? True : False;
type IfThenElse<condition extends Bool, then_value, else_value> =
  [condition] extends [True] ? then_value : else_value;
type Not<bool extends Bool> = IfThenElse<bool, False, True>;
type And<left extends Bool, right extends Bool> = Extends<
  [left, right],
  [True, True]
>;
type Or<left extends Bool, right extends Bool> = Not<
  Extends<[left, right], [False, False]>
>;

type ExtendsAnyOf<type, types> = Extends<type, type & types[keyof types]>;

const Aleph = Symbol();
type Aleph = typeof Aleph;
const Omicron = Symbol();
type Omicron = typeof Omicron;

type IsNever<type> = Extends<[type | Aleph], [Aleph]>;
type IsAny<type> = Extends<[Aleph], [type & Omicron]>;

type TypeRelation<Actual, Expected> =
  // handle anys
  IfThenElse<
    IsAny<Actual>,
    IfThenElse<
      IsAny<Expected>,
      Identical,
      ActualIsSupersetOfExpected
    >,
    IfThenElse<
      IsAny<Expected>,
      ActualIsSubsetOfExpected,
      // handle nevers
      IfThenElse<
        IsNever<Actual>,
        IfThenElse<
          IsNever<Expected>,
          Identical,
          ActualIsSubsetOfExpected
        >,
        IfThenElse<
          IsNever<Expected>,
          ActualIsSupersetOfExpected,
          // handle real relationships
          IfThenElse<
            Extends<Expected, Actual>,
            IfThenElse<
              Extends<Actual, Expected>,
              Identical,
              ActualIsSupersetOfExpected
            >,
            IfThenElse<
              Extends<Actual, Expected>,
              ActualIsSubsetOfExpected,
              // types are mutually incompatible
              Incompatible
            >
          >
        >
      >
    >
  >;

type Identical = "Actual and expected types are identical.";
type ActualIsSupersetOfExpected =
  "Actual type extends/is a strict superset of expected type.";
type ActualIsSubsetOfExpected =
  "Actual type is extended by/is a strict subset of expected type.";
type Incompatible = "Actual type is incompatible with expected type.";

type Pass = "Pass";
type StaticFailure<Message> = [Message];
