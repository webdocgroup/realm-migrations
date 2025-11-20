jest.mock('realm');

import MockedRealm from 'realm';

import { RealmMock } from '../../__mocks__/realm';
import { Schema } from '../Schema';
import { RealmMigrationService } from '.';

const Realm = MockedRealm as RealmMock;

describe('RealmMigrationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Realm.__reset();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should do nothing if the schema version matches the migration version', () => {
        const migrationService = new RealmMigrationService({
            databaseName: 'testDatabase',
            migrations: [
                {
                    description: 'Initial migration',
                    migrate: () => {},
                    schemas: [
                        {
                            name: 'MockUsers',
                            properties: { id: 'int', name: 'string' },
                        },
                    ],
                },
            ],
        });

        Realm.__setSchemaVersion(1);

        const schemaResult = migrationService.run();

        expect(Realm.__constructorSpy).not.toHaveBeenCalled();
        expect(schemaResult.schema).toEqual([
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string' },
            },
        ]);
        expect(schemaResult.schemaVersion).toBe(1);
    });

    it('should run each migration one by one', () => {
        const databaseName = 'testDatabase';
        const migrateMock1 = jest.fn();
        const schemas1: Schema[] = [
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string' },
            },
        ];
        const schemas2: Schema[] = [
            {
                name: 'MockUsers',
                properties: {
                    id: 'int',
                    name: 'string',
                    age: 'int',
                },
            },
            {
                name: 'MockPosts',
                properties: { id: 'int', content: 'string' },
            },
        ];
        const migrateMock2 = jest.fn();
        const migrationService = new RealmMigrationService({
            databaseName: databaseName,
            migrations: [
                {
                    description: 'First migration',
                    migrate: migrateMock1,
                    schemas: schemas1,
                },
                {
                    description: 'Second migration',
                    migrate: migrateMock2,
                    schemas: schemas2,
                },
            ],
        });

        Realm.__setSchemaVersion(-1);

        const schemaResult = migrationService.run();

        expect(Realm.__constructorSpy).toHaveBeenNthCalledWith(1, {
            path: `${databaseName}.realm`,
            schema: schemas1,
            onMigration: migrateMock1,
            schemaVersion: 1,
        });

        expect(Realm.__constructorSpy).toHaveBeenNthCalledWith(2, {
            path: `${databaseName}.realm`,
            schema: schemas2,
            onMigration: migrateMock2,
            schemaVersion: 2,
        });

        expect(schemaResult.schema).toEqual(schemas2);
        expect(schemaResult.schemaVersion).toBe(2);
    });

    it('should only run pending migrations (not re-run previous)', () => {
        const databaseName = 'testDatabasePendingOnly';
        const migrateMock1 = jest.fn();
        const migrateMock2 = jest.fn();
        const schemas1: Schema[] = [
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string' },
            },
        ];
        const schemas2: Schema[] = [
            {
                name: 'MockUsers',
                properties: {
                    id: 'int',
                    name: 'string',
                    age: 'int',
                },
            },
            {
                name: 'MockPosts',
                properties: { id: 'int', content: 'string' },
            },
        ];

        const migrationService = new RealmMigrationService({
            databaseName,
            migrations: [
                {
                    description: 'First migration',
                    migrate: migrateMock1,
                    schemas: schemas1,
                },
                {
                    description: 'Second migration',
                    migrate: migrateMock2,
                    schemas: schemas2,
                },
            ],
        });

        Realm.__setSchemaVersion(1);

        const result = migrationService.run();

        // only second migration should run once
        expect(Realm.__constructorSpy).toHaveBeenCalledTimes(1);
        expect(Realm.__constructorSpy).toHaveBeenCalledWith({
            path: `${databaseName}.realm`,
            schema: schemas2,
            onMigration: migrateMock2,
            schemaVersion: 2,
        });
        expect(result.schemaVersion).toBe(2);
    });

    it('should run all migrations when schema version is -1 (fresh database)', () => {
        const databaseName = 'testDatabaseFresh';
        const migrateMock1 = jest.fn();
        const migrateMock2 = jest.fn();
        const schemas1: Schema[] = [
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string' },
            },
        ];
        const schemas2: Schema[] = [
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string', age: 'int' },
            },
        ];

        const migrationService = new RealmMigrationService({
            databaseName,
            migrations: [
                { description: 'm1', migrate: migrateMock1, schemas: schemas1 },
                { description: 'm2', migrate: migrateMock2, schemas: schemas2 },
            ],
        });

        Realm.__setSchemaVersion(-1);

        const result = migrationService.run();

        expect(Realm.__constructorSpy).toHaveBeenCalledTimes(2);
        expect(result.schemaVersion).toBe(2);
    });

    it('should run 2 pending migrations', () => {
        const databaseName = 'testDatabaseAlreadyMigrated';
        const migrateMock1 = jest.fn();
        const migrateMock2 = jest.fn();
        const migrateMock3 = jest.fn();
        const schemas1: Schema[] = [
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string' },
            },
        ];
        const schemas2: Schema[] = [
            {
                name: 'MockUsers',
                properties: { id: 'int', name: 'string', age: 'int' },
            },
        ];
        const schemas3: Schema[] = [
            {
                name: 'MockUsers',
                properties: {
                    id: 'int',
                    name: 'string',
                    age: 'int',
                    nickname: 'string',
                },
            },
        ];

        const migrationService = new RealmMigrationService({
            databaseName,
            migrations: [
                { description: 'm1', migrate: migrateMock1, schemas: schemas1 },
                { description: 'm2', migrate: migrateMock2, schemas: schemas2 },
                { description: 'm3', migrate: migrateMock3, schemas: schemas3 },
            ],
        });

        Realm.__setSchemaVersion(1);

        const result = migrationService.run();

        expect(Realm.__constructorSpy).toHaveBeenCalledTimes(2);
        expect(result.schemaVersion).toBe(3);
    });

    describe('hooks', () => {
        it('should support shouldRunMigrations hooks', () => {
            const shouldRunMigrationsHook = jest.fn(() => false);

            const migrationService = new RealmMigrationService({
                databaseName: 'testDatabase',
                migrations: [
                    {
                        description: 'Initial migration',
                        migrate: () => {},
                        schemas: [
                            {
                                name: 'MockUsers',
                                properties: { id: 'int', name: 'string' },
                            },
                        ],
                    },
                ],
                hooks: {
                    shouldRunMigrations: [shouldRunMigrationsHook],
                },
            });

            Realm.__setSchemaVersion(-1);

            migrationService.run();

            expect(Realm.__constructorSpy).not.toHaveBeenCalled();

            expect(shouldRunMigrationsHook).toHaveBeenCalled();
        });
    });

    it('should support disabling the migrations by default', () => {
        const migrationService = new RealmMigrationService({
            databaseName: 'testDatabase',
            migrations: [
                {
                    description: 'Initial migration',
                    migrate: () => {},
                    schemas: [
                        {
                            name: 'MockUsers',
                            properties: { id: 'int', name: 'string' },
                        },
                    ],
                },
            ],
            enabled: false,
        });

        Realm.__setSchemaVersion(-1);

        const { schemaVersion } = migrationService.run();

        expect(Realm.__constructorSpy).not.toHaveBeenCalled();

        expect(schemaVersion).toBe(-1);
    });

    it('should support enabling the migrations by default', () => {
        const migrationService = new RealmMigrationService({
            databaseName: 'testDatabase',
            migrations: [
                {
                    description: 'Initial migration',
                    migrate: () => {},
                    schemas: [
                        {
                            name: 'MockUsers',
                            properties: { id: 'int', name: 'string' },
                        },
                    ],
                },
            ],
            enabled: true,
        });

        Realm.__setSchemaVersion(-1);

        const { schemaVersion } = migrationService.run();

        expect(Realm.__constructorSpy).toHaveBeenCalled();

        expect(schemaVersion).toBe(1);
    });
});
