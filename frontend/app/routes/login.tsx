/**
 * Login Page Route
 * Thin wrapper that composes auth feature components
 */

import React from 'react';
import { useAuth, LoginForm } from '~/features/auth';
import { AuthLayout } from '~/components/AuthLayout';
import { SigninFeaturePanel } from '~/components/FeaturePanels';

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to access your dashboard."
      rightPanel={<SigninFeaturePanel />}
    >
      <LoginForm 
        onSubmit={login}
        isLoading={isLoading}
        error={error}
        onErrorClear={clearError}
      />
    </AuthLayout>
  );
}
