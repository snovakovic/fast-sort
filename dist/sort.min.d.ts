declare type IOrder = 1 | -1;
export interface IComparer {
    (a: any, b: any, order: IOrder): number;
}
export interface ISortInstanceOptions {
    comparer?: IComparer;
    inPlaceSorting?: boolean;
}
export interface ISortByFunction<T> {
    (prop: T): any;
}
export declare type ISortBy<T> = keyof T | ISortByFunction<T> | (keyof T | ISortByFunction<T>)[];
export interface ISortByAscSorter<T> extends ISortInstanceOptions {
    asc: boolean | ISortBy<T>;
}
export interface ISortByDescSorter<T> extends ISortInstanceOptions {
    desc: boolean | ISortBy<T>;
}
export declare type ISortByObjectSorter<T> = ISortByAscSorter<T> | ISortByDescSorter<T>;
export interface IFastSort<T> {
    /**
     * Sort array in ascending order.
     * @example
     * sort([3, 1, 4]).asc();
     * sort(users).asc(u => u.firstName);
     * sort(users).asc([
     *   u => u.firstName,
     *   u => u.lastName,
     * ]);
     */
    asc(sortBy?: ISortBy<T> | ISortBy<T>[]): T[];
    /**
     * Sort array in descending order.
     * @example
     * sort([3, 1, 4]).desc();
     * sort(users).desc(u => u.firstName);
     * sort(users).desc([
     *   u => u.firstName,
     *   u => u.lastName,
     * ]);
     */
    desc(sortBy?: ISortBy<T> | ISortBy<T>[]): T[];
    /**
     * Sort array in ascending or descending order. It allows sorting on multiple props
     * in different order for each of them.
     * @example
     * sort(users).by([
     *  { asc: u => u.score },
     *  { desc: u => u.age },
     * ]);
     */
    by(sortBy: ISortByObjectSorter<T> | ISortByObjectSorter<T>[]): T[];
}
export declare function createNewSortInstance(opts: ISortInstanceOptions & {
    inPlaceSorting?: false;
}): <T>(arrayToSort: readonly T[]) => IFastSort<T>;
export declare function createNewSortInstance(opts: ISortInstanceOptions): <T>(arrayToSort: T[]) => IFastSort<T>;
export declare const defaultComparer: (a: any, b: any, order: IOrder) => number;
export declare const sort: <T>(arrayToSort: readonly T[]) => IFastSort<T>;
export declare const inPlaceSort: <T>(arrayToSort: T[]) => IFastSort<T>;
export {};
