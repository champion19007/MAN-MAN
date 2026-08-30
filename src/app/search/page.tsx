import type { Metadata } from 'next';
import { SearchClient } from '@/components/search-client';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search manga and manhwa by title, author, or artist.',
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Search</h1>
      <SearchClient />
    </div>
  );
}
