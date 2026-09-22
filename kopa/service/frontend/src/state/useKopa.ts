import { useContext } from 'react';
import { KopaContext, type KopaValue } from './context';

export function useKopa(): KopaValue {
  const value = useContext(KopaContext);
  if (value === null) throw new Error('useKopa must be used inside <KopaProvider>');
  return value;
}
