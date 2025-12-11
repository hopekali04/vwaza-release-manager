/**
 * Admin Dashboard Route
 * Thin wrapper that uses admin feature components
 */

import React from 'react';
import { AdminOverview } from '~/features/admin';

export default function AdminDashboard() {
  return <AdminOverview />;
}
