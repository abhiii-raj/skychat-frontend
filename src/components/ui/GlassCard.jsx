import React from 'react';
import styles from '../../styles/uiPrimitives.module.css';

export function GlassCard({ className = '', children }) {
  return <article className={`${styles.glassCard} ${className}`.trim()}>{children}</article>;
}
