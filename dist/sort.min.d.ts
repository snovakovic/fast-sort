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
export declare const createNewSortInstance: (opts: ISortInstanceOptions) => <T>(_ctx: T[]) => {
    /**
     * Sort array in ascending order.
     * @example
     * sort([3, 1, 4]).asc();
     * sort(users).asc(u => u.firstName);
     * sort(users).asc([
     *   U => u.firstName
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
     *   U => u.firstName
     *   u => u.lastName,
     * ]);
     */
    desc(sortBy?: ISortBy<T> | ISortBy<T>[]): T[];
    /**
     * Sort array in ascending or descending order. It allows sorting on multiple props
     * in different order for each of them.
     * @example
     * sort(users).by([
     *  { asc: u => u.score }
     *  { desc: u => u.age }
     * ]);
     */
    by(sortBy: ISortByObjectSorter<T> | ISortByObjectSorter<T>[]): T[];
};
export declare const sort: <T>(_ctx: T[]) => {
    /**
     * Sort array in ascending order.
     * @example
     * sort([3, 1, 4]).asc();
     * sort(users).asc(u => u.firstName);
     * sort(users).asc([
     *   U => u.firstName
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
     *   U => u.firstName
     *   u => u.lastName,
     * ]);
     */
    desc(sortBy?: ISortBy<T> | ISortBy<T>[]): T[];
    /**
     * Sort array in ascending or descending order. It allows sorting on multiple props
     * in different order for each of them.
     * @example
     * sort(users).by([
     *  { asc: u => u.score }
     *  { desc: u => u.age }
     * ]);
     */
    by(sortBy: ISortByObjectSorter<T> | ISortByObjectSorter<T>[]): T[];
};
export declare const inPlaceSort: <T>(_ctx: T[]) => {
    /**
     * Sort array in ascending order.
     * @example
     * sort([3, 1, 4]).asc();
     * sort(users).asc(u => u.firstName);
     * sort(users).asc([
     *   U => u.firstName
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
     *   U => u.firstName
     *   u => u.lastName,
     * ]);
     */
    desc(sortBy?: ISortBy<T> | ISortBy<T>[]): T[];
    /**
     * Sort array in ascending or descending order. It allows sorting on multiple props
     * in different order for each of them.
     * @example
     * sort(users).by([
     *  { asc: u => u.score }
     *  { desc: u => u.age }
     * ]);
     */
    by(sortBy: ISortByObjectSorter<T> | ISortByObjectSorter<T>[]): T[];
};
export {};
