import { useEffect, useRef } from 'react';

interface UseScrollSyncProps {
  sourceRef: React.RefObject<HTMLElement>;
  targetRef: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

export const useScrollSync = ({ sourceRef, targetRef, enabled = true }: UseScrollSyncProps) => {
  const isScrolling = useRef(false);

  useEffect(() => {
    if (!enabled || !sourceRef.current || !targetRef.current) return;

    const sourceElement = sourceRef.current;
    const targetElement = targetRef.current;

    const handleSourceScroll = () => {
      if (isScrolling.current) return;
      
      isScrolling.current = true;
      
      const sourceScrollTop = sourceElement.scrollTop;
      const sourceScrollHeight = sourceElement.scrollHeight;
      const sourceClientHeight = sourceElement.clientHeight;
      
      const targetScrollHeight = targetElement.scrollHeight;
      const targetClientHeight = targetElement.clientHeight;
      
      // 计算目标元素的滚动位置
      const scrollRatio = sourceScrollTop / (sourceScrollHeight - sourceClientHeight);
      const targetScrollTop = scrollRatio * (targetScrollHeight - targetClientHeight);
      
      targetElement.scrollTop = targetScrollTop;
      
      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    };

    const handleTargetScroll = () => {
      if (isScrolling.current) return;
      
      isScrolling.current = true;
      
      const targetScrollTop = targetElement.scrollTop;
      const targetScrollHeight = targetElement.scrollHeight;
      const targetClientHeight = targetElement.clientHeight;
      
      const sourceScrollHeight = sourceElement.scrollHeight;
      const sourceClientHeight = sourceElement.clientHeight;
      
      // 计算源元素的滚动位置
      const scrollRatio = targetScrollTop / (targetScrollHeight - targetClientHeight);
      const sourceScrollTop = scrollRatio * (sourceScrollHeight - sourceClientHeight);
      
      sourceElement.scrollTop = sourceScrollTop;
      
      requestAnimationFrame(() => {
        isScrolling.current = false;
      });
    };

    sourceElement.addEventListener('scroll', handleSourceScroll, { passive: true });
    targetElement.addEventListener('scroll', handleTargetScroll, { passive: true });

    return () => {
      sourceElement.removeEventListener('scroll', handleSourceScroll);
      targetElement.removeEventListener('scroll', handleTargetScroll);
    };
  }, [sourceRef, targetRef, enabled]);
};
