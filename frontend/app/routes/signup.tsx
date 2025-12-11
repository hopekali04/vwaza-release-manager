/**
 * Signup Page Route
 * Thin wrapper that composes auth feature components
 */

import React from 'react';
import { useAuth, SignupForm } from '~/features/auth';
import { AuthLayout } from '~/components/AuthLayout';
import { SignupFeaturePanel } from '~/components/FeaturePanels';

export default function SignupPage() {
  const { signup, isLoading, error, clearError } = useAuth();

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of African creators today."
      rightPanel={<SignupFeaturePanel />}
    >
      <SignupForm 
        onSubmit={signup}
        isLoading={isLoading}
        error={error}
        onErrorClear={clearError}
      />
    </AuthLayout>
  );
}
