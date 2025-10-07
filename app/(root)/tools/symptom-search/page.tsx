'use client'

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ClockIcon, FileQuestionIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { RecentSearch } from '@/types/recent-search';
import Link from 'next/link';
const SymptomFormMain = dynamic(() => import('./_components/symptom-form-main'), { ssr: false });

const fetchRecentSearches = async (): Promise<RecentSearch[]> => {
  const response = await fetch('/api/symptom-search/recent');
  if (!response.ok) {
    throw new Error('Failed to fetch recent searches');
  }
  return response.json();
};

export default function SymptomSearchPage() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: recentSearches = [], isLoading, error: queryError } = useQuery<RecentSearch[]>({
    queryKey: ['recent-searches'],
    queryFn: fetchRecentSearches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <section className="relative overflow-x-hidden flex flex-col font-inter min-h-svh">
      <div className="w-full px-[1.15rem] py-8 lg:px-8">
        <header className='relative flex items-center lg:mb-10 space-y-8'>
          <h1 className="shadow-heading text-4xl sm:text-5xl md:text-6xl my-4">Symptom Analyzer</h1>
        </header>
        <section className='flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between'>
          <main className='lg:max-w-6xl mx-auto border rounded-lg p-2 lg:p-6 bg-[#ddd2] dark:bg-[#2222] backdrop-blur-lg'>
            <SymptomFormMain />
          </main>
          <section className="p-2 bg-[#eee2] dark:bg-[#2222] shadow rounded-lg w-full lg:w-1/2 border">
            <div className="flex items-center justify-center p-2 gap-2 mb-4">
              <ClockIcon className="w-5 h-5" />
              <h1 className="text-2xl font-bold">Recent</h1>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading recent searches...
                </p>
              </div>
            ) : queryError ? (
              <div className="text-center py-8">
                <FileQuestionIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error loading recent searches. Please try again later.
                </p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="space-y-3">
                {recentSearches.map((search, index) => (
                  <Link key={search.searchId || index} href={`/tools/symptom-search/${search.searchId}`} className="block p-3 bg-white dark:bg-neutral-800 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                          {search.title || 'Untitled Search'}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {search.symptoms}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {format(new Date(search.createdAt), 'MMM d, yyyy - h:mm a')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileQuestionIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No recent searches found. Your searches will appear here.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </section>
  );
}