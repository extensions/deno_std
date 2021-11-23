export type Pass = "static assertions must pass";
export type Failure<Message> = [Message];

export const assertStatic = <Assertion extends Pass>() => undefined;
export type AssertStatic<Assertion extends Pass> = undefined;

// Unique sentinel types used for internal type comparisons.
const Aleph = Symbol();
type Aleph = typeof Aleph;
const Omicron = Symbol();
type Omicron = typeof Omicron;

type Contravariant<T> = (contravariant: T) => null;
type Covariant<T> = (covariant: null) => T;
type Invariant<T> = (invariant: T) => T;

export type TypeEquals<Actual, Expected> =
  // if Actual is any
  Invariant<Omicron> extends Invariant<Aleph & Actual> ? (
    // if Expected is any
    Invariant<Omicron> extends Invariant<Aleph & Expected> ? (
      Pass
    )
      // else (Expected is not any)
      : (
        Failure<
          [
            "Actual type was any, but Expected was not.",
            { Actual: Actual; Expected: Expected },
          ]
        >
      )
  )
    // else (Actual is not any)
    : (
      // if Expected is any
      Invariant<Omicron> extends Invariant<Expected & Aleph> ? (
        Failure<
          ["Expected type was any, but Actual was not.", { Actual: Actual }]
        >
      )
        // else (Expected is not Any)
        : (
          // if Actual is never
          Invariant<Aleph> extends Invariant<Aleph | Actual> ? (
            // if Expected is never
            Invariant<Aleph> extends Invariant<Aleph | Expected> ? (
              Pass
            ) : (
              Failure<["Actual type was never, but expected was not.", {Expected: Expected}]>
            )
          )
          // else (Actual is not never)
              : (
                // if Expected is never

              Invariant<Aleph> extends Invariant<Aleph | Expected> ? (
                Failure<["Expected type was never, but actual was not.", {Actual: Actual}]>
              )


        )
    );

// export type _TypeEquals<Actual, Expected> = If<
//   Equals<Actual, Expected>,
//   Pass,
//   Failure<[
//     "Expected Actual type to exactly match Expected type ",
//     Expected,
//     " but Actual type was ",
//     Actual,
//     ". ",
//     TypeRelation<Actual, Expected>,
//   ]>
// >;

// // To avoid confusion with the typical boolean types, we declare our own unique
// // boolean type for our type comparison results.
// export type Bool = True | False;
// const True = Symbol();
// export type True = typeof True;
// const False = Symbol();
// export type False = typeof False;

// // Wrap the built-in `extends` operator as a Bool-returning type function.
// export type Extends<Actual, Expected> = Actual extends Expected ? True : False;

// // `never` is the only type that should have no effect when unioned
// export type IsNever<Type> = Extends<[Type | Aleph], [Aleph]>;
// // Types represent the four possible relationships we model between two types.
// //
// // The string values for each of these types are used in diagnostic messages.
// export type Relation =
//   | Identical<string>
//   | Incompatible
//   | ActualIsSubsetOfExpected
//   | ActualIsSupersetOfExpected;
// // Identical types are mutually-assignable, and both or neither are `any`.
// export type Identical<Details extends string> =
//   `Actual and Expected types are identical (${Details}).`;
// // Actual is a strict superset of Expected, which means that `Expected extends Actual`
// // with additional constraints, and values of type Expected are assignable to
// // variables/arguments of type Actual but not the opposite.
// export type ActualIsSupersetOfExpected =
//   "Actual type is a strict superset of Expected type.";
// // Actual is a strict subset of Expected, which means that `Actual extends Expected`
// // with additional constraints, and values of type Actual are assignable to
// // variables/arguments of type Expected but not the opposite.
// export type ActualIsSubsetOfExpected = "Actual type is a strict subset of Expected type.";
// // The types are incompatible, and mutally-unassignable, or only one is `any`.
// export type Incompatible = "Actual type is incompatible with Expected type.";

// export type TypeRelation<Actual, Expected> =
//   // `any` is incoherent with the rest of the type system, so we for simplicity
//   // define it as  incompatible with/unrelated to every type but itself.
//   If<
//     IsAny<Actual>,
//     If<
//       IsAny<Expected>,
//       Identical<"both are any">,
//       Incompatible
//     >,
//     If<
//       IsAny<Expected>,
//       Incompatible,
//       // handle nevers
//       If<
//         IsNever<Actual>,
//         If<
//           IsNever<Expected>,
//           Identical<"both are never">,
//           ActualIsSubsetOfExpected
//         >,
//         If<
//           IsNever<Expected>,
//           ActualIsSupersetOfExpected,
//           // handle real relationships
//           If<
//             Extends<[Expected], [Actual]>,
//             If<
//               Extends<[Actual], [Expected]>,
//               Identical<"their types are mutually-assignable">,
//               ActualIsSupersetOfExpected
//             >,
//             If<
//               Extends<[Actual], [Expected]>,
//               ActualIsSubsetOfExpected,
//               // types are mutually incompatible
//               Incompatible
//             >
//           >
//         >
//       >
//     >
//   >;
