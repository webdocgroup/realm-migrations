import Realm from 'realm';

const DEFAULT_SCHEMA_VERSION = -1;

type RealmConfig = ConstructorParameters<typeof Realm>[0];

let schemaVersion = DEFAULT_SCHEMA_VERSION;

const constructorSpy = jest.fn();
const schemaVersionSpy = jest.fn((_path: string) => schemaVersion);

const mockInstance = {
    write: jest.fn((fn) => fn()),
    create: jest.fn(),
    objects: jest.fn(),
    delete: jest.fn(),
    close: jest.fn(),
} as unknown as Realm;

const MockedRealm = function (this: any, config: RealmConfig) {
    constructorSpy(config);
    return mockInstance;
} as unknown as jest.MockedClass<typeof Realm> & RealmMockExtension;

MockedRealm.schemaVersion = (path: string) => {
    schemaVersionSpy(path);
    return schemaVersion;
};

interface RealmMockExtension {
    __constructorSpy: typeof constructorSpy;
    __schemaVersionSpy: typeof schemaVersionSpy;
    __setSchemaVersion: (v: number) => void;
    __mockInstance: typeof mockInstance;
    __reset: () => void;
}

MockedRealm.__constructorSpy = constructorSpy;
MockedRealm.__schemaVersionSpy = schemaVersionSpy;
MockedRealm.__mockInstance = mockInstance;

MockedRealm.__setSchemaVersion = (v: number) => {
    schemaVersion = v;
};

MockedRealm.__reset = () => {
    schemaVersion = DEFAULT_SCHEMA_VERSION;
    constructorSpy.mockReset();
    schemaVersionSpy.mockReset();
    Object.values(mockInstance).forEach((fn) => {
        if (typeof fn === 'function' && 'mockReset' in fn) {
            fn.mockReset();
        }
    });
};

export type RealmMock = typeof Realm & RealmMockExtension;

export default MockedRealm;
