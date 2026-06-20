import { useEffect } from 'react';
import Contact from '../components/sections/Contact';

export default function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <Contact />;
}
