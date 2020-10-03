# LambdaStore

LambdaStore is a functional-style firestore library.

# Installation

To install the latest stable version along with peer dependencies

    npm i lambda-store rambda fp-ts io-ts

**Note**. [`fp-ts`](https://github.com/gcanti/fp-ts),
[`io-ts`](https://github.com/gcanti/io-ts) and
[`rambda`](https://github.com/selfrefactor/rambda) are peer dependencies
for `lambda-store`

# Documentation

## Data layer

LambdaStore enforces a few key aspects for entities, and considers
entities and models as two completely different things. Models represent
application-level data, while entities represent the actual data stored
in the database. You can think of entities and models as living in
separate worlds, entities live in database-world and models live in
application-world. These worlds need to be connected somehow;
LambdaStore takes a functional approach and requires a mapper, a
function that can translate entities into models and viceversa.

In the case of Firestore, entities can be seen as objects that extend
the `DocumentData` interface (basically a `Record<String, any>`), these
objects coming straight from Firestore can be expected to hold
`Firestore.Timestamp` as well as `Firestore.DocumentReference` objects
along with your traditional numbers, strings, arrays and simple objects.
Data modeling in Firestore is a big monster in and of itself, but _this
library_ aims to decrease the amount of work developers have to do
upfront; entities read using _the library_ will always extend the
`Entity` type:

```typescript
export type Entity = {
  id: string
  path: string
  createTime: Date
  updateTime: Date
}
```

This means that `id`, `path`, `createTime` and `updateTime` are
effectively reserved fields. This doesn’t mean that they will be stored
in the database, tho, instead these fields are auto filled-in (read _for
free_) using data from the `Firestore.DocumentSnapshot` object firestore
entities come wrapped in anyways.
