import { useRef } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { hideTabBar, showTabBar } from '../utils/tabBarEmitter';

export function useScrollHide() {
  const lastOffsetY = useRef(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    
    // Always show when at the very top
    if (currentY <= 0) {
      showTabBar();
      lastOffsetY.current = currentY;
      return;
    }

    const diff = currentY - lastOffsetY.current;

    if (diff > 10) {
      // Scrolling down -> hide
      hideTabBar();
      lastOffsetY.current = currentY;
    } else if (diff < -10) {
      // Scrolling up -> show
      showTabBar();
      lastOffsetY.current = currentY;
    }
  };

  return { onScroll };
}
