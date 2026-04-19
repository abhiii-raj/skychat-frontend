import React from 'react';
import styles from '../../styles/uiPrimitives.module.css';

const variantClassMap = {
  blue: styles.badgeBlue,
  green: styles.badgeGreen,
  red: styles.badgeRed,
};

export function StatusBadge({ variant = 'blue', children }) {
  const colorClass = variantClassMap[variant] || styles.badgeBlue;
  return <span className={`${styles.statusBadge} ${colorClass}`}>{children}</span>;
}
