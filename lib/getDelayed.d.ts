export declare type DelayedConfig = {
    unit: 's' | 'sec' | 'second' | 'seconds' | 'm' | 'min' | 'minute' | 'minutes' | 'h' | 'hour' | 'hours' | 'd' | 'day' | 'days';
    value: number;
};
export default function getDelayed(delayed?: DelayedConfig, from?: Date): string | null;
