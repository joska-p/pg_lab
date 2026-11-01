export type Brand<K, T> = K & { __brand: T };
export type Branded<T, B> = Brand<T, B>;
