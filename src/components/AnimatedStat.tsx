'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface AnimatedStatProps {
  value: number;
  className?: string;
}

export function AnimatedStat({ value, className = '' }: AnimatedStatProps) {
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1.3, color: '#ea580c' }}
      animate={{ scale: 1, color: 'inherit' }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{ display: 'inline-block' }}
    >
      {value}
    </motion.span>
  );
}
