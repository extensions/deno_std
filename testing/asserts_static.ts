export const assertStatic = <Assertion extends Pass>() => undefined;
export type AssertStatic<Assertion extends Pass> = undefined;

export type TypeEquals<Left, Right> = If<
  Equals<Left, Right>,
  Pass,
  Failure<[
    "Expected left type to exactly match right type ",
    Right,
    " but left type was ",
    Left,
    ". ",
    TypeRelation<Left, Right>,
  ]>
>;

type Pass = "static assertions must pass";
type Failure<Message> = [Message];

// To avoid confusion with the typical boolean types, we declare our own unique
// boolean type for our type comparison results.
type Bool = True | False;
const True = Symbol();
type True = typeof True;
const False = Symbol();
type False = typeof False;

// Wrap the built-in `extends` operator as a Bool-returning type function.
type Extends<Left, Right> = Left extends Right ? True : False;

// Chooses a type based on whether the first argument is `True`.
//
// `True` is the only truthy type. Everything else is falsey, including the
// `False | True` union type, although we try to avoid creating that.
type If<Condition extends Bool, Then = unknown, Else = never> =
  [Condition] extends [True] ? Then
    : Else;

type Not<Condition extends Bool> = If<Condition, False, True>;
type And<Left extends Bool, Right extends Bool> = Extends<
  [Left, Right],
  [True, True]
>;
type Or<Left extends Bool, Right extends Bool> = Not<
  Extends<
    [Left, Right],
    [False, False]
  >
>;

// Note that wrapping types T and U as [T] and [U] before an `extends`
// comparison restricts variance in some way that should prevent a union
// parameter type from causing a union of results.
type Equals<Left, Right> = And<
  Extends<[Left], [Right]>,
  Extends<[Right], [Left]>
>;

// `never` is the only type that should have no effect when unioned
type IsNever<Type> = Extends<[Type | Aleph], [Aleph]>;
// Aleph and Omicron are entirely unrelated, so only `any` can be intersected
// with one to subvert the type system so as to let it extend the other.
type IsAny<Type> = Extends<[Type & Aleph], [Omicron]>;

// Unique sentinel types used for internal type comparisons.
const Aleph = Symbol();
type Aleph = typeof Aleph;
const Omicron = Symbol();
type Omicron = typeof Omicron;

// Types represent the four possible relationships we model between two types.
//
// The string values for each of these types are used in diagnostic messages.
//
// `any` is a special case that subverts the type system. For our purposes we
// choose to evaluate it as though it is a superset of all other types, although
// its actual behaviour can't be simply defined as a type set.
type Relation =
  | Identical
  | Incompatible
  | LeftIsSubsetOfRight
  | LeftIsSupersetOfRight;
// Identical types are mutually-assignable, and both or neither are `any`.
type Identical = "Left and expected types are identical.";
// Left is a strict superset of right, which means that `right extends left`
// with additional constraints, and values of type right are assignable to
// variables/arguments of type left but not the opposite.
type LeftIsSupersetOfRight = "Left type is a strict superset of right type.";
// Left is a strict subset of right, which means that `left extends right`
// with additional constraints, and values of type left are assignable to
// variables/arguments of type right but not the opposite.
type LeftIsSubsetOfRight = "Left type is a strict subset of right type.";
// The types are incompatible, and mutally-unassignable, or only one is `any`.
type Incompatible = "Left type is incompatible with right type.";

type TypeRelation<Left, Right> =
  // `any` is incoherent with the rest of the type system, so we for simplicity
  // define it as  incompatible with/unrelated to every type but itself.
  If<
    IsAny<Left>,
    If<
      IsAny<Right>,
      Identical,
      Incompatible
    >,
    If<
      IsAny<Right>,
      Incompatible,
      // handle nevers
      If<
        IsNever<Left>,
        If<
          IsNever<Right>,
          Identical,
          LeftIsSubsetOfRight
        >,
        If<
          IsNever<Right>,
          LeftIsSupersetOfRight,
          // handle real relationships
          If<
            Extends<[Right], [Left]>,
            If<
              Extends<[Left], [Right]>,
              Identical,
              LeftIsSupersetOfRight
            >,
            If<
              Extends<[Left], [Right]>,
              LeftIsSubsetOfRight,
              // types are mutually incompatible
              Incompatible
            >
          >
        >
      >
    >
  >;
