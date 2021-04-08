import { assert } from 'chai';
import {
  sort,
  inPlaceSort,
  createNewSortInstance,
} from '../src/sort';

describe('sort', () => {
  let flatArray:number[];
  let flatNaturalArray:string[];
  let students:{
    name:string,
    dob:Date,
    address:{ streetNumber?:number },
  }[];
  let multiPropArray:{
    name:string,
    lastName:string,
    age:number,
    unit:string,
  }[];

  beforeEach(() => {
    flatArray = [1, 5, 3, 2, 4, 5];
    flatNaturalArray = ['A10', 'A2', 'B10', 'B2'];

    students = [{
      name: 'Mate',
      dob: new Date(1987, 14, 11),
      address: { streetNumber: 3 },
    }, {
      name: 'Ante',
      dob: new Date(1987, 14, 9),
      address: {},
    }, {
      name: 'Dino',
      dob: new Date(1987, 14, 10),
      address: { streetNumber: 1 },
    }];

    multiPropArray = [{
      name: 'aa',
      lastName: 'aa',
      age: 10,
      unit: 'A10',
    }, {
      name: 'aa',
      lastName: undefined,
      age: 8,
      unit: 'A2',
    }, {
      name: 'aa',
      lastName: null,
      age: 9,
      unit: 'A01',
    }, {
      name: 'aa',
      lastName: 'bb',
      age: 11,
      unit: 'C2',
    }, {
      name: 'bb',
      lastName: 'aa',
      age: 6,
      unit: 'B3',
    }];
  });

  it('Should sort flat array in ascending order', () => {
    const sorted = sort(flatArray).asc();
    assert.deepStrictEqual(sorted, [1, 2, 3, 4, 5, 5]);

    // flatArray should not be modified
    assert.deepStrictEqual(flatArray, [1, 5, 3, 2, 4, 5]);
    assert.notEqual(sorted,flatArray);
  });

  it('Should in place sort flat array in ascending order', () => {
    const sorted = inPlaceSort(flatArray).asc();
    assert.deepStrictEqual(sorted, [1, 2, 3, 4, 5, 5]);

    assert.deepStrictEqual(flatArray, [1, 2, 3, 4, 5, 5]);
    assert.equal(sorted, flatArray);
  });

  it('Should sort flat array in descending order', () => {
    const sorted = sort(flatArray).desc();
    assert.deepStrictEqual(sorted, [5, 5, 4, 3, 2, 1]);

    // Passed array is not mutated
    assert.deepStrictEqual(flatArray, [1, 5, 3, 2, 4, 5]);

    // Can do in place sorting
    const sorted2 = inPlaceSort(flatArray).desc();
    assert.equal(sorted2, flatArray);
    assert.deepStrictEqual(flatArray, [5, 5, 4, 3, 2, 1]);
  });

  it('Should sort flat array with by sorter', () => {
    const sorted = sort(flatArray).by({ asc: true });
    assert.deepStrictEqual(sorted, [1, 2, 3, 4, 5, 5]);

    const sorted2 = sort(flatArray).by({ desc: true });
    assert.deepStrictEqual(sorted2, [5, 5, 4, 3, 2, 1]);

    // Passed array is not mutated
    assert.deepStrictEqual(flatArray, [1, 5, 3, 2, 4, 5]);

    // Can do in place sorting
    const sorted3 = inPlaceSort(flatArray).by({ desc: true });
    assert.equal(sorted3, flatArray);
    assert.deepStrictEqual(flatArray, [5, 5, 4, 3, 2, 1]);
  });

  it('Should sort by student name in ascending order', () => {
    const sorted = sort(students).asc(p => p.name.toLowerCase());
    assert.deepStrictEqual(['Ante', 'Dino', 'Mate'], sorted.map(p => p.name));
  });

  it('Should sort by student name in descending order', () => {
    const sorted = sort(students).desc((p) => p.name.toLowerCase());
    assert.deepStrictEqual(['Mate', 'Dino', 'Ante'], sorted.map(p => p.name));
  });

  it('Should sort nil values to the bottom', () => {
    const sorted1 = sort(students).asc((p) => p.address.streetNumber);
    assert.deepStrictEqual([1, 3, undefined], sorted1.map(p => p.address.streetNumber));

    const sorted2 = sort(students).desc((p) => p.address.streetNumber);
    assert.deepStrictEqual([3, 1, undefined], sorted2.map(p => p.address.streetNumber));

    assert.deepStrictEqual(
      sort([1, undefined, 3, null, 2]).asc(),
      [1, 2, 3, null, undefined],
    );

    assert.deepStrictEqual(
      sort([1, undefined, 3, null, 2]).desc(),
      [3, 2, 1, null, undefined],
    );
  });

  it('Should ignore values that are not sortable', () => {
    assert.equal(sort('string' as any).asc(), 'string' as any);
    assert.equal(sort(undefined).desc(), undefined);
    assert.equal(sort(null).desc(), null);
    assert.equal(sort(33 as any).asc(), 33 as any);
    assert.deepStrictEqual(sort({ name: 'test' } as any).desc(), { name: 'test' } as any);
    assert.equal((sort(33 as any) as any).by({ asc: true }), 33 as any);
  });

  it('Should sort dates correctly', () => {
    const sorted = sort(students).asc('dob');
    assert.deepStrictEqual(sorted.map(p => p.dob), [
      new Date(1987, 14, 9),
      new Date(1987, 14, 10),
      new Date(1987, 14, 11),
    ]);
  });

  it('Should sort on single property when passed as array', () => {
    const sorted = sort(students).asc(['name']);
    assert.deepStrictEqual(['Ante', 'Dino', 'Mate'], sorted.map(p => p.name));
  });

  it('Should sort on multiple properties', () => {
    const sorted = sort(multiPropArray).asc([
      p => p.name,
      p => p.lastName,
      p => p.age,
    ]);

    const sortedArray = sorted.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
      { name: 'bb', lastName: 'aa', age: 6 },
    ]);
  });

  it('Should sort on multiple properties by string sorter', () => {
    const sorted = sort(multiPropArray).asc(['name', 'age', 'lastName']);
    const sortedArray = sorted.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'bb', lastName: 'aa', age: 6 },
    ]);
  });

  it('Should sort on multiple mixed properties', () => {
    const sorted = sort(multiPropArray).asc(['name', p => p.lastName, 'age']);
    const sortedArray = sorted.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
      { name: 'bb', lastName: 'aa', age: 6 },
    ]);
  });

  it('Should sort with all equal values', () => {
    const same = [
      { name: 'a', age: 1 },
      { name: 'a', age: 1 },
    ];

    const sorted = sort(same).asc(['name', 'age']);
    assert.deepStrictEqual(sorted, [
      { name: 'a', age: 1 },
      { name: 'a', age: 1 },
    ]);
  });

  it('Should sort descending by name and ascending by lastName', () => {
    const sorted = sort(multiPropArray).by([
      { desc: 'name' },
      { asc: 'lastName' },
    ]);
    const sortedArray = sorted.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
    }));

    assert.deepStrictEqual(sortedArray, [
      { name: 'bb', lastName: 'aa' },
      { name: 'aa', lastName: 'aa' },
      { name: 'aa', lastName: 'bb' },
      { name: 'aa', lastName: null },
      { name: 'aa', lastName: undefined },
    ]);
  });

  it('Should sort ascending by name and descending by age', () => {
    const sorted = sort(multiPropArray).by([
      { asc: 'name' },
      { desc: 'age' },
    ]);

    const sortedArray = sorted.map(arr => ({ name: arr.name, age: arr.age }));
    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', age: 11 },
      { name: 'aa', age: 10 },
      { name: 'aa', age: 9 },
      { name: 'aa', age: 8 },
      { name: 'bb', age: 6 },
    ]);
  });

  it('Should sort ascending by lastName, descending by name and ascending by age', () => {
    const sorted = sort(multiPropArray).by([
      { asc: p => p.lastName },
      { desc: p => p.name },
      { asc: p => p.age },
    ]);

    const sortedArray = sorted.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepStrictEqual(sortedArray, [
      { name: 'bb', lastName: 'aa', age: 6 },
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
    ]);
  });

  it('Should throw error if asc or desc props not provided with object config', () => {
    const errorMessage = 'Invalid sort config: Expected `asc` or `desc` property';

    assert.throws(
      () => sort(multiPropArray).by([{ asci: 'name' }] as any),
      Error,
      errorMessage,
    );
    assert.throws(
      () => sort(multiPropArray).by([{ asc: 'lastName' }, { ass: 'name' }] as any),
      Error,
      errorMessage,
    );
    assert.throws(() => sort([1, 2]).asc(null), Error, errorMessage);
    assert.throws(() => sort([1, 2]).desc([1, 2, 3] as any), Error, errorMessage);
  });

  it('Should throw error if both asc and dsc props provided with object config', () => {
    const errorMessage = 'Invalid sort config: Ambiguous object with `asc` and `desc` config properties';

    assert.throws(
      () => sort(multiPropArray).by([{ asc: 'name', desc: 'lastName' }] as any),
      Error,
      errorMessage,
    );
  });

  it('Should throw error if using nested property with string syntax', () => {
    assert.throw(
      () => sort(students).desc('address.streetNumber' as any),
      Error,
      'Invalid sort config: String syntax not allowed for nested properties.',
    );
  });

  it('Should sort ascending on single property with by sorter', () => {
    const sorted = sort(multiPropArray).by([{ asc: p => p.age }]);
    assert.deepStrictEqual([6, 8, 9, 10, 11], sorted.map(m => m.age));
  });

  it('Should sort descending on single property with by sorter', () => {
    const sorted = sort(multiPropArray).by([{ desc: 'age' }]);
    assert.deepStrictEqual([11, 10, 9, 8, 6], sorted.map(m => m.age));
  });

  it('Should sort flat array in asc order using natural sort comparer', () => {
    const sorted = sort(flatNaturalArray).by([{
      asc: true,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepStrictEqual(sorted, ['A2', 'A10', 'B2', 'B10']);
  });

  it('Should sort flat array in desc order using natural sort comparer', () => {
    const sorted = sort(flatNaturalArray).by([{
      desc: true,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepStrictEqual(sorted, ['B10', 'B2', 'A10', 'A2']);
  });

  it('Should sort object in asc order using natural sort comparer', () => {
    const sorted = sort(multiPropArray).by([{
      asc: p => p.unit,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepStrictEqual(['A01', 'A2', 'A10', 'B3', 'C2'], sorted.map(m => m.unit));
  });

  it('Should sort object in desc order using natural sort comparer', () => {
    const sorted = sort(multiPropArray).by([{
      desc: p => p.unit,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepStrictEqual(['C2', 'B3', 'A10', 'A2', 'A01'], sorted.map(m => m.unit));
  });

  it('Should sort object on multiple props using both default and custom comparer', () => {
    const testArr = [
      { a: 'A2', b: 'A2' },
      { a: 'A2', b: 'A10' },
      { a: 'A10', b: 'A2' },
    ];

    const sorted = sort(testArr).by([{
      desc: p => p.a,
    }, {
      asc: 'b',
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepStrictEqual(sorted, [
      { a: 'A2', b: 'A2' },
      { a: 'A2', b: 'A10' }, // <= B is sorted using natural sort comparer
      { a: 'A10', b: 'A2' }, // <= A is sorted using default sort comparer
    ]);
  });

  // BUG repo case: https://github.com/snovakovic/fast-sort/issues/18
  it('Sort by comparer should not override default sort of other array property', () => {
    const rows = [
      { status: 0, title: 'A' },
      { status: 0, title: 'D' },
      { status: 0, title: 'B' },
      { status: 1, title: 'C' },
    ];

    const sorted = sort(rows).by([{
      asc: row => row.status,
      comparer: (a, b) => a - b,
    }, {
      asc: row => row.title,
    }]);

    assert.deepStrictEqual(sorted, [
      { status: 0, title: 'A' },
      { status: 0, title: 'B' },
      { status: 0, title: 'D' },
      { status: 1, title: 'C' },
    ]);
  });

  it('Should create natural sort instance and handle sorting correctly', () => {
    const naturalSort = createNewSortInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });

    const sorted1 = naturalSort(multiPropArray).desc('unit');
    assert.deepStrictEqual(['C2', 'B3', 'A10', 'A2', 'A01'], sorted1.map(m => m.unit));

    const sorted2 = naturalSort(multiPropArray).by({ asc: 'unit' });
    assert.deepStrictEqual(['A01', 'A2', 'A10', 'B3', 'C2'], sorted2.map(m => m.unit));

    const sorted3 = naturalSort(multiPropArray).asc('lastName');
    assert.deepStrictEqual(['aa', 'aa', 'bb', null, undefined], sorted3.map(m => m.lastName));

    const sorted4 = naturalSort(multiPropArray).desc(p => p.lastName);
    assert.deepStrictEqual([undefined, null, 'bb', 'aa', 'aa'], sorted4.map(m => m.lastName));

    const sorted5 = naturalSort(flatArray).desc();
    assert.deepStrictEqual(sorted5, [5, 5, 4, 3, 2, 1]);

    const sorted6 = naturalSort(flatNaturalArray).asc();
    assert.deepStrictEqual(sorted6, ['A2', 'A10', 'B2', 'B10']);
  });

  it('Should handle sorting on multiples props with custom sorter instance', () => {
    const naturalSort = createNewSortInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });

    const arr = [
      { a: 'a', b: 'A2' },
      { a: 'a', b: 'A20' },
      { a: 'a', b: null },
      { a: 'a', b: 'A3' },
      { a: 'a', b: undefined },
    ];

    const sort1 = naturalSort(arr).asc('b');
    assert.deepStrictEqual(sort1.map(a => a.b), ['A2', 'A3', 'A20', null, undefined]);

    const sorted2 = naturalSort(arr).asc(['a', 'b']);
    assert.deepStrictEqual(sorted2.map(a => a.b), ['A2', 'A3', 'A20', null, undefined]);

    const sorted3 = naturalSort(arr).desc('b');
    assert.deepStrictEqual(sorted3.map(a => a.b), [undefined, null, 'A20', 'A3', 'A2']);

    const sorted4 = naturalSort(arr).desc(['a', 'b']);
    assert.deepStrictEqual(sorted4.map(a => a.b), [undefined, null, 'A20', 'A3', 'A2']);
  });

  it('Should create custom tag sorter instance', () => {
    const tagImportance = { vip: 3, influencer: 2, captain: 1 };
    const customTagComparer = (a, b) => (tagImportance[a] || 0) - (tagImportance[b] || 0);

    const tags = ['influencer', 'unknown', 'vip', 'captain'];

    const tagSorter = createNewSortInstance({ comparer: customTagComparer });
    assert.deepStrictEqual(tagSorter(tags).asc(), ['unknown', 'captain', 'influencer', 'vip']);
    assert.deepStrictEqual(tagSorter(tags).desc(), ['vip', 'influencer', 'captain', 'unknown']);
    assert.deepStrictEqual(sort(tags).asc(tag => tagImportance[tag] || 0), ['unknown', 'captain', 'influencer', 'vip']);
  });

  it('Should be able to override natural sort comparer', () => {
    const naturalSort = createNewSortInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });

    const sorted1 = naturalSort(multiPropArray).by([{
      asc: 'name',
    }, {
      desc: 'unit',
      comparer(a, b) { // NOTE: override natural sort
        if (a === b) return 0;
        return a < b ? -1 : 1;
      },
    }]);

    let sortedArray = sorted1.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', unit: 'C2' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A01' },
      { name: 'bb', unit: 'B3' },
    ]);

    const sorted2 = naturalSort(multiPropArray).by([{ asc: 'name' }, { desc: 'unit' }]);
    sortedArray = sorted2.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', unit: 'C2' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'A01' },
      { name: 'bb', unit: 'B3' },
    ]);
  });

  it('Should sort in asc order with by sorter if object config not provided', () => {
    const sorted = sort(multiPropArray).by(['name', 'unit'] as any);
    const sortedArray = sorted.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', unit: 'A01' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'C2' },
      { name: 'bb', unit: 'B3' },
    ]);
  });

  it('Should ignore empty array as a sorting prop', () => {
    assert.deepStrictEqual(sort([2, 1, 4]).asc([]), [1, 2, 4]);
  });

  it('Should sort by computed property', () => {
    const repos = [
      { openIssues: 0, closedIssues: 5 },
      { openIssues: 4, closedIssues: 4 },
      { openIssues: 3, closedIssues: 3 },
    ];

    const sorted1 = sort(repos).asc(r => r.openIssues + r.closedIssues);
    assert.deepStrictEqual(sorted1, [
      { openIssues: 0, closedIssues: 5 },
      { openIssues: 3, closedIssues: 3 },
      { openIssues: 4, closedIssues: 4 },
    ]);

    const sorted2 = sort(repos).desc(r => r.openIssues + r.closedIssues);
    assert.deepStrictEqual(sorted2, [
      { openIssues: 4, closedIssues: 4 },
      { openIssues: 3, closedIssues: 3 },
      { openIssues: 0, closedIssues: 5 },
    ]);
  });

  it('Should not mutate sort by array', () => {
    const sortBy = [{ asc: 'name' }, { asc: 'unit' }];
    const sorted = sort(multiPropArray).by(sortBy as any);
    assert.deepStrictEqual(sortBy, [{ asc: 'name' }, { asc: 'unit' }]);

    const sortedArray = sorted.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepStrictEqual(sortedArray, [
      { name: 'aa', unit: 'A01' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'C2' },
      { name: 'bb', unit: 'B3' },
    ]);
  });

  it('Should sort readme example for natural sort correctly', () => {
    const testArr = ['image-2.jpg', 'image-11.jpg', 'image-3.jpg'];

    // By default fast-sort is not doing natural sort
    const sorted1 = sort(testArr).desc(); // =>
    assert.deepStrictEqual(sorted1, ['image-3.jpg', 'image-2.jpg', 'image-11.jpg']);

    const sorted2 = sort(testArr).by({
      desc: true,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });
    assert.deepStrictEqual(sorted2, ['image-11.jpg', 'image-3.jpg', 'image-2.jpg']);

    // If we want to reuse natural sort in multiple places we can create new sort instance
    const naturalSort = createNewSortInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });

    const sorted3 = naturalSort(testArr).asc();
    assert.deepStrictEqual(sorted3, ['image-2.jpg', 'image-3.jpg', 'image-11.jpg']);

    const sorted4 = naturalSort(testArr).desc();
    assert.deepStrictEqual(sorted4, ['image-11.jpg', 'image-3.jpg', 'image-2.jpg']);

    assert.notEqual(sorted3, testArr);
  });

  it('Should create sort instance that sorts nil value to the top in desc order', () => {
    const nilSort = createNewSortInstance({
      comparer(a, b):number {
        if (a == null) return 1;
        if (b == null) return -1;
        if (a < b) return -1;
        if (a === b) return 0;

        return 1;
      },
    });

    const sorter1 = nilSort(multiPropArray).asc(p => p.lastName);
    assert.deepStrictEqual(['aa', 'aa', 'bb', null, undefined], sorter1.map(p => p.lastName));

    const sorter2 = nilSort(multiPropArray).desc(p => p.lastName);
    assert.deepStrictEqual([undefined, null, 'bb', 'aa', 'aa'], sorter2.map(p => p.lastName));

    // By default custom sorter should not mutate provided array
    assert.notEqual(sorter1, multiPropArray);
    assert.notEqual(sorter2, multiPropArray);
  });

  it('Should mutate array with custom sorter if inPlaceSorting provided', () => {
    const customInPlaceSorting = createNewSortInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
      inPlaceSorting: true, // <= NOTE
    });

    const sorted = customInPlaceSorting(flatArray).asc();

    assert.equal(sorted, flatArray);
    assert.deepStrictEqual(flatArray, [1, 2, 3, 4, 5, 5]);
  });

});
