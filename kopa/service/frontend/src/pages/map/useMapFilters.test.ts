import { describe, expect, it } from 'vitest';
import { LATVIA_BOUNDS } from '../../data/regions';
import { toBoundsLiteral } from './bounds';
import { toggle } from './useMapFilters';

describe('toggle', () => {
  it('adds a value that is not there yet', () => {
    expect(toggle(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes a value that is', () => {
    expect(toggle(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('never mutates the array it was given', () => {
    const original = ['a', 'b'];

    toggle(original, 'c');
    toggle(original, 'a');

    expect(original).toEqual(['a', 'b']);
  });

  it('turns an empty selection on and straight back off', () => {
    expect(toggle(toggle([], 'a'), 'a')).toEqual([]);
  });
});

describe('toBoundsLiteral', () => {
  it('copies the readonly data shape into the mutable pair Leaflet wants', () => {
    expect(toBoundsLiteral(LATVIA_BOUNDS)).toEqual([
      [55.62, 20.85],
      [58.1, 28.3],
    ]);
  });

  it('hands back a fresh array, so Leaflet cannot write into the data file', () => {
    const literal = toBoundsLiteral(LATVIA_BOUNDS);

    expect(literal).not.toBe(LATVIA_BOUNDS);
    expect(literal[0]).not.toBe(LATVIA_BOUNDS[0]);
  });
});
