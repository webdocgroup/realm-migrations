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

## 📦 Install

Install the package using npm:

```sh
npm install @webdocgroup/realm-migrations
```

## 🚀 Usage

### 1. Define a Realm Schema

Create a schema for your Realm objects. For example, a simple Users schema:

```ts
// ./schemas/Users/V1/index.ts

import type Realm from 'realm';

export const UsersV1Schema: Realm.ObjectSchema = {
    name: 'Users',
    primaryKey: 'id',
    properties: {
        id: 'string',
    },
};
```

### 2. Create a Migration Step

It's conventional to prefix migration filenames with a timestamp for clarity:

```ts
// ./migrations/202507291336_seed.ts

import Realm from 'realm';
import { Migration } from '@webdocgroup/realm-migrations';
import { UsersV1Schema } from '../schemas/Users/V1';

export const SeedMigration: Migration = {
    description: 'Set up the database', // Describe the change for clarity
    schemas: [UsersV1Schema], // Only include schemas added/changed since last migration
};
```

### 3. Run Migrations in Your App

Instantiate the migration service and get the latest schema and version:

```ts
// index.ts

import Realm from 'realm';
import { RealmMigrationService } from '@webdocgroup/realm-migrations';
import { SeedMigration } from './migrations/202507291336_seed';

const databaseName = 'default';

// Run migrations and get the up-to-date schema and version
const { schema, schemaVersion } = new RealmMigrationService({
    databaseName,
    migrations: [SeedMigration],
}).run();

// Instantiate your fully migrated Realm instance with the schema and schema version provided
const realm = new Realm({
    path: `${databaseName}.realm`,
    schemaVersion,
    schema,
});
```

### 4. Add a New Migration (Example)

Suppose you want to add a Comments schema and a new property to Users:

```ts
import Realm from 'realm';

// ./schemas/Comments/V1/index.ts
export const CommentsV1Schema: Realm.ObjectSchema = {
    name: 'Comments',
    primaryKey: 'id',
    properties: {
        id: 'string',
        comment: 'string',
    },
};

// ./schemas/Users/V2/index.ts
export const UsersV2Schema: Realm.ObjectSchema = {
    name: 'Users',
    primaryKey: 'id',
    properties: {
        id: 'string',
        name: 'string', // New property
    },
};

// ./migrations/202508071336_add_comments_and_user_name.ts
import { Migration } from '@webdocgroup/realm-migrations';
import { CommentsV1Schema } from '../schemas/Comments/V1';
import { UsersV2Schema } from '../schemas/Users/V2';

export const AddCommentsAndUserNameMigration: Migration = {
    description: 'Add Comments and user name',
    schemas: [UsersV2Schema, CommentsV1Schema],
};
```

Update the migration service to include the new migration:

```diff
// index.ts

import Realm from 'realm';

const { schema, schemaVersion } = new RealmMigrationService({
    databaseName,
    migrations: [
        SeedMigration,
+       AddCommentsAndUserNameMigration
    ],
}).run();

const realm = new Realm({
    path: `${databaseName}.realm`,
    schemaVersion,
    schema,
});
```
