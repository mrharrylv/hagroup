import { describe, expect, it } from 'vitest';
import { faqEntries } from './faq';

describe('faqEntries', () => {
  it('is empty when the page has no faq field', () => {
    expect(faqEntries({})).toEqual([]);
    expect(faqEntries({ faq: undefined })).toEqual([]);
  });

  it('is empty when faq is not an array', () => {
    expect(faqEntries({ faq: 'nope' })).toEqual([]);
    expect(faqEntries({ faq: { question: 'q', answer: 'a' } })).toEqual([]);
  });

  it('keeps well-formed entries in order and trims them', () => {
    const faq = [
      { question: ' What is DevOps? ', answer: ' Automation. ' },
      { question: 'Second?', answer: 'Yes.' },
    ];
    expect(faqEntries({ faq })).toEqual([
      { question: 'What is DevOps?', answer: 'Automation.' },
      { question: 'Second?', answer: 'Yes.' },
    ]);
  });

  it('drops entries missing a question or an answer', () => {
    const faq = [
      { question: 'Kept?', answer: 'Kept.' },
      { question: '', answer: 'No question.' },
      { question: 'No answer?' },
      { question: 7, answer: 'Not a string.' },
      null,
      'string',
    ];
    expect(faqEntries({ faq })).toEqual([{ question: 'Kept?', answer: 'Kept.' }]);
  });

  it('returns new objects and leaves the input untouched', () => {
    const entry = { question: 'Q?', answer: 'A.' };
    const [copy] = faqEntries({ faq: [entry] });
    expect(copy).not.toBe(entry);
    expect(entry).toEqual({ question: 'Q?', answer: 'A.' });
  });
});
