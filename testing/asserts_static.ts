export type Pass = "static assertions must pass";
export type Failure<Message> = [Message];

export const assertStatic = <Assertion extends Pass>() => undefined;
export type AssertStatic<Assertion extends Pass> = undefined;

// Unique sentinel types used for internal type comparisons.
enum Aleph {
  _ = "",
}
enum Omicron {
  _ = "",
}

// Aleph and Omicron are entirely unrelated, so only `any` can be intersected
// with one to subvert the type system so as to let it extend the other.
export type IsAny<Type> = Extends<[Type & Aleph], [Omicron]>;

export type TypeEquals<Left, Right> =
  // if Left is any
  [Omicron & Left] extends [Aleph] ? (
    // if Right is any
    [Omicron & Right] extends [Aleph] ? (
      Failure<["both are any", { Left: Left }, { Right: Right }]>
    )
      : (
        Failure<["Left type was any, but right was not.", { Right: Right }]>
      )
  )
    : (
      // if Right is any
      [Omicron] extends [Right & Aleph] ? (
        // then
        Failure<["Right type was any, but left was not.", { Left: Left }]>
        // else
      )
        : (
          "who knows"
        )
    );

// export type _TypeEquals<Left, Right> = If<
//   Equals<Left, Right>,
//   Pass,
//   Failure<[
//     "Expected left type to exactly match right type ",
//     Right,
//     " but left type was ",
//     Left,
//     ". ",
//     TypeRelation<Left, Right>,
//   ]>
// >;

// // To avoid confusion with the typical boolean types, we declare our own unique
// // boolean type for our type comparison results.
// export type Bool = True | False;
// const True = Symbol();
// export type True = typeof True;
// const False = Symbol();
// export type False = typeof False;

// Wrap the built-in `extends` operator as a Bool-returning type function.
export type Extends<Left, Right> = Left extends Right ? True : False;

// `never` is the only type that should have no effect when unioned
export type IsNever<Type> = Extends<[Type | Aleph], [Aleph]>;
// Types represent the four possible relationships we model between two types.
//
// The string values for each of these types are used in diagnostic messages.
export type Relation =
  | Identical<string>
  | Incompatible
  | LeftIsSubsetOfRight
  | LeftIsSupersetOfRight;
// Identical types are mutually-assignable, and both or neither are `any`.
export type Identical<Details extends string> =
  `Left and right types are identical (${Details}).`;
// Left is a strict superset of right, which means that `right extends left`
// with additional constraints, and values of type right are assignable to
// variables/arguments of type left but not the opposite.
export type LeftIsSupersetOfRight =
  "Left type is a strict superset of right type.";
// Left is a strict subset of right, which means that `left extends right`
// with additional constraints, and values of type left are assignable to
// variables/arguments of type right but not the opposite.
export type LeftIsSubsetOfRight = "Left type is a strict subset of right type.";
// The types are incompatible, and mutally-unassignable, or only one is `any`.
export type Incompatible = "Left type is incompatible with right type.";

export type TypeRelation<Left, Right> =
  // `any` is incoherent with the rest of the type system, so we for simplicity
  // define it as  incompatible with/unrelated to every type but itself.
  If<
    IsAny<Left>,
    If<
      IsAny<Right>,
      Identical<"both are any">,
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
          Identical<"both are never">,
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
              Identical<"their types are mutually-assignable">,
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
