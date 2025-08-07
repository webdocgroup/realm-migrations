import Realm from 'realm';
import { Schema } from '../Schema';
import { Migration } from '../Migration';

type RealmMigrationWithVersion = Migration & { version: number };

export type RealmMigrationServiceConfig = {
    databaseName: string;
    migrations: Migration[];
};

type SchemasByName = Record<string, Schema>;

type MigrationResult = {
    schema: Schema[];
    schemaVersion: number;
};

export class RealmMigrationService {
    private migrations: Migration[] = [];

    private databaseName: string;

    public constructor({
        databaseName,
        migrations,
    }: RealmMigrationServiceConfig) {
        this.databaseName = databaseName;
        this.migrations = migrations;
    }

    private currentSchemaVersion(): number {
        const dbPath = `${this.databaseName}.realm`;
        const currentSchemaVersion = Realm.schemaVersion(dbPath);

        return currentSchemaVersion;
    }

    private latestMigrationVersion(): number {
        return this.migrations.length;
    }

    private nextSchemaVersion(): number {
        const currentSchemaVersion = this.currentSchemaVersion();
        const nextSchemaVersion = currentSchemaVersion + 1;

        if (this.migrations[nextSchemaVersion]) {
            return nextSchemaVersion;
        }

        return currentSchemaVersion;
    }

    private shouldRun({
        currentVersion,
        latestMigrationVersion,
    }: {
        currentVersion: number;
        latestMigrationVersion: number;
    }): boolean {
        return currentVersion < latestMigrationVersion;
    }

    /**
     * Derives the schemas for a given version by combining all migrations
     * up to that version.
     *
     * @param version The version to derive schemas for.
     *
     * @returns An array of schemas that represent the state of the database
     * at the specified version.
     */
    private derriveSchemas(version: number): Schema[] {
        const migrationsForVersion = this.migrations.slice(0, version);

        const schemasByName = migrationsForVersion.reduce<SchemasByName>(
            (schemasByName, migration) => {
                const schemasByNameInMigration =
                    migration.schemas.reduce<SchemasByName>((acc, schema) => {
                        return { ...acc, [schema.name]: schema };
                    }, {});

                return { ...schemasByName, ...schemasByNameInMigration };
            },
            {}
        );

        return Object.values(schemasByName);
    }

    private migrationsToRun(): RealmMigrationWithVersion[] {
        const currentSchemaVersion = Math.max(
            0,
            this.currentSchemaVersion() - 1
        );

        return this.migrations
            .map((migration, index) => ({
                ...migration,
                version: index + 1,
            }))
            .slice(currentSchemaVersion, this.migrations.length);
    }

    run(): MigrationResult {
        const currentVersion = this.currentSchemaVersion();
        const latestMigrationVersion = this.latestMigrationVersion();

        if (!this.shouldRun({ currentVersion, latestMigrationVersion })) {
            console.info('No migrations to run', {
                currentVersion,
                latestMigrationVersion,
            });

            return {
                schema: this.derriveSchemas(currentVersion),
                schemaVersion: currentVersion,
            };
        }

        const migrations = this.migrationsToRun();

        let latestMigratedSchemas: Schema[] = [];
        let schemaVersion: number = -1;

        console.info(`Running ${migrations.length} migrations`, {
            currentVersion,
            latestMigrationVersion,
        });

        migrations.forEach((migration) => {
            console.info(`Running migration: ${migration.description}`, {
                migrationVersion: migration.version,
                schemaCount: migration.schemas.length,
            });

            const derivedSchema = this.derriveSchemas(migration.version);

            console.info('Derived schemas for migration', {
                count: derivedSchema.length,
            });

            const migrated = new Realm({
                path: `${this.databaseName}.realm`,
                onMigration: migration.migrate,
                schema: derivedSchema,
                schemaVersion: migration.version,
            });
            migrated.close();

            latestMigratedSchemas = derivedSchema;
            schemaVersion = migration.version;
        });

        console.info('Migrations completed', {
            currentSchemaVersion: this.currentSchemaVersion(),
        });

        return {
            schema: latestMigratedSchemas,
            schemaVersion,
        };
    }
}
