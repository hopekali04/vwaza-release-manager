import { Link } from 'react-router';
import { useReleases } from '~/features/releases';
import { ReleaseList } from '~/features/releases';
import { Button } from '~/components/ui';

export default function ReleasesPage() {
  const { releases, isLoading, error, deleteRelease, submitRelease } = useReleases();

  if (isLoading && releases.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-neutral-400">Loading releases...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Releases</h1>
          <p className="text-neutral-400 mt-1">Manage your music releases and tracks</p>
        </div>
        <Link to="/dashboard/releases/new">
          <Button variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Release
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <ReleaseList
        releases={releases}
        onDelete={deleteRelease}
        onSubmit={submitRelease}
        showActions={true}
      />
    </div>
  );
}
