import { ShouldRunMigrationsHook, shouldRunMigrationsHook } from '.';

describe('shouldRunMigrationsHook', () => {
    it('should pass the props through each hook', () => {
        const props = {
            currentVersion: 1,
            latestMigrationVersion: 2,
        };
        const next = jest.fn(() => false);

        const result = shouldRunMigrationsHook({
            props,
            hooks: [],
            callback: next,
        });

        expect(next).toHaveBeenCalledWith(props);
        expect(result).toBe(false);
    });

    it('should invoke the callback if no pipes return early', () => {
        const props = {
            currentVersion: 1,
            latestMigrationVersion: 2,
        };

        const hook: ShouldRunMigrationsHook = (props, next) => {
            return next(props);
        };

        const callback = jest.fn(() => true);

        const result = shouldRunMigrationsHook({
            props,
            hooks: [hook],
            callback,
        });

        expect(callback).toHaveBeenCalledWith(props);
        expect(result).toBe(true);
    });

    it('should override the callback if a hook returns after', () => {
        const props = {
            currentVersion: 1,
            latestMigrationVersion: 2,
        };

        const hook: ShouldRunMigrationsHook = (props, next) => {
            next(props);

            return true;
        };

        const callback = jest.fn(() => false);

        const result = shouldRunMigrationsHook({
            props,
            hooks: [hook],
            callback,
        });

        expect(callback).toHaveBeenCalled();
        expect(result).toBe(true);
    });
});
