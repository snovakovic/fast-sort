import { assert } from 'chai';
import sort from '../src/sort';

describe('sort', () => {
  let flatArray:number[];
  let flatNaturalArray:string[];
  let persons:{
    name:string,
    dob:Date,
    address:{ code?:number },
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

    persons = [{
      name: 'last',
      dob: new Date(1987, 14, 11),
      address: { code: 3 },
    }, {
      name: 'FIRST',
      dob: new Date(1987, 14, 9),
      address: {},
    }, {
      name: 'In the middle',
      dob: new Date(1987, 14, 10),
      address: { code: 1 },
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
    assert.deepEqual(sorted, [1, 2, 3, 4, 5, 5]);
    assert.equal(sorted, flatArray);
  });

  it('Should sort flat array in descending order', () => {
    sort(flatArray).desc();
    assert.deepEqual(flatArray, [5, 5, 4, 3, 2, 1]);
  });

  it('Should be able to sort flat arrays with by sorter', () => {
    let sorted = sort(flatArray).by({ asc: true });
    assert.deepEqual(sorted, [1, 2, 3, 4, 5, 5]);

    sorted = sort(flatArray).by({ desc: true });
    assert.deepEqual(sorted, [5, 5, 4, 3, 2, 1]);
  });

  it('Should sort by object property in ascending order', () => {
    sort(persons).asc(p => p.name.toLowerCase());
    assert.deepEqual(['FIRST', 'In the middle', 'last'], persons.map(p => p.name));
  });

  it('Should sort by object property in descending order', () => {
    sort(persons).desc((p) => p.name.toLowerCase());
    assert.deepEqual(['last', 'In the middle', 'FIRST'], persons.map(p => p.name));
  });

  it('Should sort nil values to the bottom', () => {
    sort(persons).asc((p) => p.address.code);
    assert.deepEqual([1, 3, undefined], persons.map(p => p.address.code));

    sort(persons).desc((p) => p.address.code);
    assert.deepEqual([3, 1, undefined], persons.map(p => p.address.code));

    assert.deepEqual(
      sort([1, undefined, 3, null, 2]).asc(),
      [1, 2, 3, null, undefined],
    );

    assert.deepEqual(
      sort([1, undefined, 3, null, 2]).desc(),
      [3, 2, 1, null, undefined],
    );
  });

  it('Should ignore values that are not sortable', () => {
    assert.equal(sort('string' as any).asc(), 'string' as any);
    assert.equal(sort(undefined).desc(), undefined);
    assert.equal(sort(null).desc(), null);
    assert.equal(sort(33 as any).asc(), 33 as any);
    assert.deepEqual(sort({ name: 'test' } as any).desc(), { name: 'test' } as any);
    assert.equal((sort(33 as any) as any).by(), 33 as any);
  });

  it('Should sort dates correctly', () => {
    sort(persons).asc('dob');
    assert.deepEqual(persons.map(p => p.dob), [
      new Date(1987, 14, 9),
      new Date(1987, 14, 10),
      new Date(1987, 14, 11),
    ]);
  });

  it('Should unwrap single array value', () => {
    sort(persons).asc(['name']);
    assert.deepEqual(['FIRST', 'In the middle', 'last'], persons.map(p => p.name));
  });

  it('Should sort on multiple properties', () => {
    sort(multiPropArray).asc([
      p => p.name,
      p => p.lastName,
      p => p.age,
    ]);

    const sortedArray = multiPropArray.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepEqual(sortedArray, [
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
      { name: 'bb', lastName: 'aa', age: 6 },
    ]);
  });

  it('Should sort on multiple properties by string sorter', () => {
    sort(multiPropArray).asc(['name', 'age', 'lastName']);
    const sortedArray = multiPropArray.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepEqual(sortedArray, [
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'bb', lastName: 'aa', age: 6 },
    ]);
  });

  it('Should sort on multiple mixed properties', () => {
    sort(multiPropArray).asc(['name', p => p.lastName, 'age']);
    const sortedArray = multiPropArray.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepEqual(sortedArray, [
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

    sort(same).asc(['name', 'age']);
    assert.deepEqual(same, [
      { name: 'a', age: 1 },
      { name: 'a', age: 1 },
    ]);
  });

  it('Should sort by desc name and asc lastName', () => {
    sort(multiPropArray).by([
      { desc: 'name' },
      { asc: 'lastName' },
    ]);
    const sortedArray = multiPropArray.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
    }));

    assert.deepEqual(sortedArray, [
      { name: 'bb', lastName: 'aa' },
      { name: 'aa', lastName: 'aa' },
      { name: 'aa', lastName: 'bb' },
      { name: 'aa', lastName: null },
      { name: 'aa', lastName: undefined },
    ]);
  });

  it('Should sort by asc name and desc age', () => {
    sort(multiPropArray).by([
      { asc: 'name' },
      { desc: 'age' },
    ]);

    const sortedArray = multiPropArray.map(arr => ({ name: arr.name, age: arr.age }));
    assert.deepEqual(sortedArray, [
      { name: 'aa', age: 11 },
      { name: 'aa', age: 10 },
      { name: 'aa', age: 9 },
      { name: 'aa', age: 8 },
      { name: 'bb', age: 6 },
    ]);
  });

  it('Should sort by asc lastName, desc name and asc age', () => {
    sort(multiPropArray).by([
      { asc: p => p.lastName },
      { desc: p => p.name },
      { asc: p => p.age },
    ]);

    const sortedArray = multiPropArray.map(arr => ({
      name: arr.name,
      lastName: arr.lastName,
      age: arr.age,
    }));

    assert.deepEqual(sortedArray, [
      { name: 'bb', lastName: 'aa', age: 6 },
      { name: 'aa', lastName: 'aa', age: 10 },
      { name: 'aa', lastName: 'bb', age: 11 },
      { name: 'aa', lastName: undefined, age: 8 },
      { name: 'aa', lastName: null, age: 9 },
    ]);
  });

  it('Should throw invalid usage of by sorter exception', () => {
    const errorMessage = 'Invalid sort config';

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

  it('Should sort ascending with by on 1 property', () => {
    sort(multiPropArray).by([{ asc: p => p.age }]);
    assert.deepEqual([6, 8, 9, 10, 11], multiPropArray.map(m => m.age));
  });

  it('Should sort descending with by on 1 property', () => {
    sort(multiPropArray).by([{ desc: 'age' }]);
    assert.deepEqual([11, 10, 9, 8, 6], multiPropArray.map(m => m.age));
  });

  it('Should sort flat array in asc order using natural sort comparer', () => {
    sort(flatNaturalArray).by([{
      asc: true,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepEqual(flatNaturalArray, ['A2', 'A10', 'B2', 'B10']);
  });

  it('Should sort flat array in desc order using natural sort comparer', () => {
    sort(flatNaturalArray).by([{
      desc: true,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepEqual(flatNaturalArray, ['B10', 'B2', 'A10', 'A2']);
  });

  it('Should sort object in asc order using natural sort comparer', () => {
    sort(multiPropArray).by([{
      asc: p => p.unit,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepEqual(['A01', 'A2', 'A10', 'B3', 'C2'], multiPropArray.map(m => m.unit));
  });

  it('Should sort object in desc order using natural sort comparer', () => {
    sort(multiPropArray).by([{
      desc: p => p.unit,
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepEqual(['C2', 'B3', 'A10', 'A2', 'A01'], multiPropArray.map(m => m.unit));
  });

  it('Should sort object on multiple props using both default and custom comparer', () => {
    const testArr = [
      { a: 'A2', b: 'A2' },
      { a: 'A2', b: 'A10' },
      { a: 'A10', b: 'A2' },
    ];

    sort(testArr).by([{
      desc: p => p.a,
    }, {
      asc: 'b',
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    }]);

    assert.deepEqual(testArr, [
      { a: 'A2', b: 'A2' },
      { a: 'A2', b: 'A10' }, // <= B is sorted using natural sort comparer
      { a: 'A10', b: 'A2' }, // <= A is sorted using default sort comparer
    ]);
  });

  it('Should create natural sort instance and handle sorting correctly', () => {
    const naturalSort = sort.createNewInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });

    naturalSort(multiPropArray).desc('unit');
    assert.deepEqual(['C2', 'B3', 'A10', 'A2', 'A01'], multiPropArray.map(m => m.unit));

    naturalSort(multiPropArray).by({ asc: 'unit' });
    assert.deepEqual(['A01', 'A2', 'A10', 'B3', 'C2'], multiPropArray.map(m => m.unit));

    naturalSort(multiPropArray).asc('lastName');
    assert.deepEqual(['aa', 'aa', 'bb', null, undefined], multiPropArray.map(m => m.lastName));

    naturalSort(multiPropArray).desc(p => p.lastName);
    assert.deepEqual([undefined, null, 'bb', 'aa', 'aa'], multiPropArray.map(m => m.lastName));

    naturalSort(flatArray).desc();
    assert.deepEqual(flatArray, [5, 5, 4, 3, 2, 1]);

    naturalSort(flatNaturalArray).asc();
    assert.deepEqual(flatNaturalArray, ['A2', 'A10', 'B2', 'B10']);
  });

  it('Should create custom tag sorter instance', () => {
    const tagImportance = { vip: 3, influencer: 2, captain: 1 };
    const customTagComparer = (a, b) => (tagImportance[a] || 0) - (tagImportance[b] || 0);

    const tags = ['influencer', 'unknown', 'vip', 'captain'];

    const tagSorter = sort.createNewInstance({ comparer: customTagComparer });
    assert.deepEqual(tagSorter(tags).asc(), ['unknown', 'captain', 'influencer', 'vip']);
    assert.deepEqual(tagSorter(tags).desc(), ['vip', 'influencer', 'captain', 'unknown']);

    assert.deepEqual(sort(tags).asc(tag => tagImportance[tag] || 0), ['unknown', 'captain', 'influencer', 'vip']);
  });

  it('Should be able to override natural sort comparer', () => {
    const naturalSort = sort.createNewInstance({
      comparer: new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }).compare,
    });

    naturalSort(multiPropArray).by([{
      asc: 'name',
    }, {
      desc: 'unit',
      comparer(a, b) { // NOTE: override natural sort
        if (a === b) return 0;
        return a < b ? -1 : 1;
      },
    }]);

    let sortedArray = multiPropArray.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepEqual(sortedArray, [
      { name: 'aa', unit: 'C2' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A01' },
      { name: 'bb', unit: 'B3' },
    ]);

    naturalSort(multiPropArray).by([{ asc: 'name' }, { desc: 'unit' }]);
    sortedArray = multiPropArray.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepEqual(sortedArray, [
      { name: 'aa', unit: 'C2' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'A01' },
      { name: 'bb', unit: 'B3' },
    ]);
  });

  it('Should sort in asc order with by sorter if object config not provided', () => {
    sort(multiPropArray).by(['name', 'unit'] as any);
    const sortedArray = multiPropArray.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepEqual(sortedArray, [
      { name: 'aa', unit: 'A01' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'C2' },
      { name: 'bb', unit: 'B3' },
    ]);
  });

  it('Should handle edge cases', () => {
    assert.deepEqual(sort([2, 1, 4]).asc([]), [1, 2, 4]);
  });

  it('Should not mutate sort by array', () => {
    const sortBy = [{ asc: 'name' }, { asc: 'unit' }];
    sort(multiPropArray).by(sortBy);
    assert.deepEqual(sortBy, [{ asc: 'name' }, { asc: 'unit' }]);

    const sortedArray = multiPropArray.map(arr => ({ name: arr.name, unit: arr.unit }));
    assert.deepEqual(sortedArray, [
      { name: 'aa', unit: 'A01' },
      { name: 'aa', unit: 'A10' },
      { name: 'aa', unit: 'A2' },
      { name: 'aa', unit: 'C2' },
      { name: 'bb', unit: 'B3' },
    ]);
  });
});
