import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ReleaseForm, useReleases } from '~/features/releases';
import type { CreateReleaseData } from '~/features/releases';
import { WizardStepper } from '~/features/releases/components/WizardStepper';

export default function NewReleasePage() {
  const navigate = useNavigate();
  const { createRelease, isLoading } = useReleases();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateReleaseData) => {
    setError(null);
    const release = await createRelease(data);
    
    if (release) {
      navigate(`/dashboard/releases/${release.id}`);
    } else {
      setError('Failed to create release. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Create New Release</h1>
        <p className="text-neutral-400 mt-1">Start by entering the basic details for your release</p>
      </div>

      {/* Wizard Stepper - Step 1 */}
      <WizardStepper currentStep={1} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-neutral-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6">
        <ReleaseForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/releases')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
