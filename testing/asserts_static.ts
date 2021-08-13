export { assertStatic };

export type {
  AssertEquals as TypeEquals,
  AssertExtends as TypeExtends,
  AssertStatic,
  AssertStrictlyExtends as TypeStrictlyExtends,
};

type Pass = "static assertions must pass";
type Failure<Message> = [Message];

const assertStatic = <Assertion extends Pass>() => undefined;

// deno-lint-ignore no-explicit-any
type AssertStatic<Assertion extends Pass> = any;

assertStatic<AssertEquals<2, 2 | 3>>();

type Assertion<Condition extends Bool, FailureMessage> = IfThen<
  Condition,
  Pass,
  Failure<FailureMessage>
>;

type AssertEquals<Left, Right> = Assertion<
  ExtendsAnyOf<
    TypeRelation<Left, Right>,
    [Identical]
  >,
  [
    "Expected left type to exactly match right type ",
    Right,
    " but left type was ",
    Left,
    ". ",
    TypeRelation<Left, Right>,
  ]
>;

type AssertExtends<Left, Right> = Assertion<
  ExtendsAnyOf<
    TypeRelation<Left, Right>,
    [Identical, LeftIsSubsetOfRight]
  >,
  [
    "Expected left type to extend or match right type ",
    Right,
    " but left type was ",
    Left,
    ". ",
    TypeRelation<Left, Right>,
  ]
>;

type AssertStrictlyExtends<Left, Right> = Assertion<
  ExtendsAnyOf<
    TypeRelation<Left, Right>,
    [LeftIsSubsetOfRight]
  >,
  [
    "Expected left type to strictly extend right type ",
    Right,
    " but left type was ",
    Left,
    ". ",
    TypeRelation<Left, Right>,
  ]
>;

const True = Symbol();
type True = typeof True;
const False = Symbol();
type False = typeof False;
type Bool = True | False;

type Extends<Left, Right> = Left extends Right ? True : False;
type ExtendsAnyOf<type, types> = Extends<type, type & types[keyof types]>;

type IfThen<Condition extends Bool, Then, Else = never> = [Condition] extends
  [True] ? Then
  : Else;

type Not<Condition extends Bool> = IfThen<Condition, False, True>;
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

const Aleph = Symbol();
type Aleph = typeof Aleph;
const Omicron = Symbol();
type Omicron = typeof Omicron;

type IsNever<type> = Extends<[type | Aleph], [Aleph]>;
type IsAny<type> = Extends<[Aleph], [type & Omicron]>;

type TypeRelation<Left, Right> =
  // handle anys
  IfThen<
    IsAny<Left>,
    IfThen<
      IsAny<Right>,
      Identical,
      LeftIsSupersetOfRight
    >,
    IfThen<
      IsAny<Right>,
      LeftIsSubsetOfRight,
      // handle nevers
      IfThen<
        IsNever<Left>,
        IfThen<
          IsNever<Right>,
          Identical,
          LeftIsSubsetOfRight
        >,
        IfThen<
          IsNever<Right>,
          LeftIsSupersetOfRight,
          // handle real relationships
          IfThen<
            Extends<Right, Left>,
            IfThen<
              Extends<Left, Right>,
              Identical,
              LeftIsSupersetOfRight
            >,
            IfThen<
              Extends<Left, Right>,
              LeftIsSubsetOfRight,
              // types are mutually incompatible
              Incompatible
            >
          >
        >
      >
    >
  >;

type Identical = "Left and expected types are identical.";
type LeftIsSupersetOfRight = "Left type is a strict superset of right type.";
type LeftIsSubsetOfRight = "Left type is a strict subset of right type.";
type Incompatible = "Left type is incompatible with right type.";
