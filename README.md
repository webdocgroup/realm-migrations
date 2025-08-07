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

### Create A Realm Schema

Create a realm schema for example a users table:

```ts
// ./schemas/Users/V1/index.ts

export const UsersV1Schema: Realm.ObjectSchema = {
    name: 'Users',
    primaryKey: 'id',
    properties: {
        id: 'string',
    },
};
```

### Create A Migration

Create a migration, you can call this whatever you want. It is conventional to prefix the migration name with the data and time e.g `./migrations/202507291336_seed.ts`

```ts
// ./migrations/202507291336_seed.ts

import { Migration } from '@webdocgroup/realm-migrations';
import { UsersV1Schema } from '../schemas/Users/V1';

export const SeedMigration: Migration = {
    /**
     * Description should be something to descibe the change
     * that has been made. This is helpful when debugging
     * migrations or describing the change to the
     * database over time.
     */
    description: 'Set up the database',

    /**
     * Add all the schemas you want to apply as part of the
     * migration. Note you only need to provide schemas
     * that have be added or changed since the last
     * migration.
     */
    schemas: [UsersV1Schema],
};
```

### Run Migrations

In your database service instantiate the Realm Migration Service providing the database name and the migrations to be run.

```ts
const databaseName = 'default';

const { schema, schemaVersion } = new RealmMigrationService({
    databaseName: databaseName,
    migrations: [SeedMigration],
}).run();

/**
 * Instantiate your own instance of Realm using the schemaVersion
 * and schemas provided by the migration service.
 *
 * This is your fully migrated Realm instance.
 */
const instance = new Realm({
    path: `${databaseName}.realm`,
    schemaVersion,
    schema,
});
```

### Next Migration

For example we might want to add a comments schema and add an additonal property to the users schema.

```ts
// ./schemas/Comments/V1/index.ts

export const CommentsV1Schema: Realm.ObjectSchema = {
    name: 'Comments',
    primaryKey: 'id',
    properties: {
        id: 'string',
        comment: 'string',
    },
};
```

```ts
// ./schemas/Users/V2/index.ts

export const UsersV2Schema: Realm.ObjectSchema = {
    name: 'Users',
    primaryKey: 'id',
    properties: {
        id: 'string',
        name: 'string', // New property
    },
};
```

```ts
// ./migrations/202508071336_add_comments_and_user_name.ts

import { Migration } from '@webdocgroup/realm-migrations';
import { CommentsV1Schema } from '../schemas/Comments/V1';
import { UsersV2Schema } from '../schemas/Users/V2';

export const AddCommentsAndUserNameMigration: Migration = {
    description: 'Add Comments and user name',
    schemas: [UsersV2Schema, CommentsV1Schema],
};
```

Add the new migration to the database migration service instance.

```diff
const databaseName = 'default';

const { schema, schemaVersion } = new RealmMigrationService({
    databaseName: databaseName,
    migrations: [
        SeedMigration,
+       AddCommentsAndUserNameMigration,
    ],
}).run();

const instance = new Realm({
    path: `${databaseName}.realm`,
    schemaVersion,
    schema,
});
```
