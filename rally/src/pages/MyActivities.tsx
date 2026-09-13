import React, { useEffect, useState } from 'react';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { api } from '@/api/client';
import type { Activity } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

type Tab = 'Joined' | 'Created' | 'Completed';

export function MyActivities() {
  const [activeTab, setActiveTab] = useState<Tab>('Joined');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getMyActivities(activeTab.toLowerCase() as 'joined' | 'created' | 'completed')
      .then(setActivities)
      .catch(error => setError(error instanceof Error ? error.message : 'Your activities could not be loaded.'));
  }, [activeTab]);

  const filteredActivities = activities;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">My Activities</h1>
        <p className="text-secondary-text text-lg">Manage your team participations and hosted events.</p>
      </div>

      <div className="flex border-b border-border mb-8">
        {(['Joined', 'Created', 'Completed'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors relative -mb-px",
              activeTab === tab ? "text-accent" : "text-secondary-text hover:text-primary-text"
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {error ? <p className="text-center py-24 text-secondary-text">{error}</p> : filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-border">
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === 'Joined' ? "You haven't joined anything yet." : 
             activeTab === 'Created' ? "You haven't created any activities." : 
             "No completed activities yet."}
          </h3>
          <p className="text-secondary-text mb-6">
            {activeTab === 'Joined' ? "Find something that matches your interests and join the team." : 
             "Be the first to create something and start building a team."}
          </p>
          <Button>
            {activeTab === 'Created' ? 'Create activity' : 'Discover activities'}
          </Button>
        </div>
      )}
    </div>
  );
}
