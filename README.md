# Realm DB Migrations For React Native

**Structured, predictable schema migrations for Realm in React Native.**

Realm Migration Service provides a type-safe, step-based migration utility for [Realm](https://www.mongodb.com/docs/atlas/device-sdks/sdk/react-native/) in React Native apps. Define clear migration steps and compose them into a single `migration` function to manage schema evolution with confidence.

---

## ✨ Features

- ✅ Declarative, versioned migration steps
- ✅ Fully typed in TypeScript
- ✅ Supports forward-only migrations
- ✅ Minimal API surface — just compose and use
- ✅ Designed for React Native + Realm

---

## ❓ Why

Managing database schema changes in production apps is challenging. Each new version of your schema can introduce breaking changes, and missing a migration step can lead to data corruption or app crashes. Ensuring that every migration runs exactly once, in the correct order, is critical for data integrity and a smooth user experience. This library helps you structure and track migrations, so you can confidently evolve your Realm schemas without fear of missing or duplicating migration logic.
