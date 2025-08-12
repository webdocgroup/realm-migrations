import { Pipeline } from '@webdocgroup/pipeline';

type Props = {
    currentVersion: number;
    latestMigrationVersion: number;
};

export type ShouldRunMigrationsHook = (
    props: Props,
    next: (props: Props) => boolean
) => boolean;

export type ShouldRunMigrationsHooks = ShouldRunMigrationsHook[];

export type ShouldRunMigrationsHookConfig = {
    props: Props;
    hooks: ShouldRunMigrationsHooks;
    callback: (props: Props) => boolean;
};

export const shouldRunMigrationsHook = ({
    callback,
    hooks,
    props,
}: ShouldRunMigrationsHookConfig) => {
    return Pipeline.create<boolean, Props>()
        .send(props)
        .through(hooks)
        .then(callback);
};
