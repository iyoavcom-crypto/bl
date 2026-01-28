import { Easing } from 'react-native';

export const animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 450,
  },
  
  easing: {
    standard: Easing.bezier(0.4, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
  },
};

export const springConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.5,
};
