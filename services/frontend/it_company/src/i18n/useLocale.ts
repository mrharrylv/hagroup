import { useContext } from 'react';
import { LocaleContext, type LocaleContextValue } from './LocaleContext';

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside a LocaleContext provider');
  return context;
}
