import { ShouldRunMigrationsHook } from '../../HookPipelines/shouldRunMigrationsHook';

export const enabled = ({
    enabled,
}: {
    enabled: boolean;
}): ShouldRunMigrationsHook => {
    return (props, next) => {
        if (!enabled) {
            return false;
        }

        return next(props);
    };
};
