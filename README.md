# PantryPilot

A household pantry and grocery expiration tracker. Everything lives on the
device: no account, no server, no network calls.

Built with React Native, Expo SDK 57, Expo Router and TypeScript. State is
`useReducer` plus context. Persistence is AsyncStorage behind a repository
module. There is no state library and no backend, on purpose.

## What it does

- Add, edit and delete food items with quantity, unit and storage location
- Ten built in categories, plus your own, with rename and safe delete
- Expiry dates, or "does not expire" for salt and rice
- Mark an item used up, and put it back
- Search across name, note and category, with location and category filters
- An Expiring screen that groups what is already past its date and what to
  use next, with the window configurable from 2 to 14 days

## Running it

```bash
npm install
npx expo start
```

Press `i` for the iOS simulator, `a` for an Android emulator, or scan the QR
code with Expo Go.

## How it is put together

```
app/                      routes, one file per screen
src/components/ui/        generic primitives: Text, Button, Field, Card
src/components/pantry/    domain components: ItemRow, ItemForm, StatusPill
src/hooks/                the public API of the state layer
src/state/                reducer, provider, selectors
src/storage/              AsyncStorage repository, schema and migrations
src/lib/                  pure helpers: dates, expiry rules, formatting
src/types/                the domain vocabulary
```

Three rules hold the app together:

1. **Expiry status is derived, never stored.** A saved status is wrong the
   moment the clock passes midnight.
2. **A calendar date is a string, an instant is an ISO timestamp.** They are
   different types because they answer different questions, and mixing them
   is how items expire a day early in half the world's time zones.
3. **One module touches AsyncStorage.** Everything above it asks for the
   pantry and gets the pantry.

## Licence

MIT.
