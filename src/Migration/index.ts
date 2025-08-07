import Realm from 'realm';

import { Schema } from '../Schema';

export type Migration = {
    description: string;
    migrate?: (prevRealm: Realm, nextRealm: Realm) => void;
    schemas: Schema[];
};
