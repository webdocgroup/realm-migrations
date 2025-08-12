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
});
