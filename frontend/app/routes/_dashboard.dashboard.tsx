/**
 * Artist Dashboard Route
 * Thin wrapper that uses artist feature components
 */

import React from 'react';
import { DashboardStats } from '~/features/artist';

export default function ArtistDashboard() {
  return <DashboardStats />;
}
