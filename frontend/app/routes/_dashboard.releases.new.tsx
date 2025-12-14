import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ReleaseForm, useReleases } from '~/features/releases';
import { WizardStepper } from '~/features/releases/components/WizardStepper';

export default function NewReleasePage() {
  const navigate = useNavigate();
  const { createRelease, isLoading } = useReleases();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setError(null);
    const release = await createRelease(data);
    
    if (release) {
      navigate(`/dashboard/releases/${release.id}`);
    } else {
      setError('Failed to create release. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Release</h1>
        <p className="text-gray-600 mt-1">Start by entering the basic details for your release</p>
      </div>

      {/* Wizard Stepper - Step 1 */}
      <WizardStepper currentStep={1} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <ReleaseForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/releases')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
