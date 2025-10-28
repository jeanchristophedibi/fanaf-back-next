declare module '*.jpg' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.jpeg' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.png' {
  import { StaticImageData } from 'next/image';
  const value: StaticImageData;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.webp' {
  const value: string;
  export default value;
}

