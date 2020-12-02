export declare type RetryConfig = {
    count: number;
    delay?: number;
};
export declare const defaultRetries: {
    count: number;
    delay: number;
};
export default function getRetries(retries?: RetryConfig | number): RetryConfig;
