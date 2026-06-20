import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type IconifyIconProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  icon?: string;
  width?: string | number;
  height?: string | number;
  flip?: string;
  rotate?: string;
  inline?: boolean;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': IconifyIconProps;
    }
  }
}

