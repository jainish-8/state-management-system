import { useRef } from 'react';

export const useRenderCounter = () => {
  const count = useRef(0);
  count.current++;
  return count.current;
};
