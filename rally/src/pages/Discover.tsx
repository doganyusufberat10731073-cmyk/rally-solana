import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { api } from '@/api/client';
import type { Activity } from '@/types';
import type { Category } from '@/types';
import { cn } from '@/utils';

const categories: (Category | 'All')[] = ['All', 'Gaming', 'Sports', 'Development', 'Learning', 'Creative', 'Social', 'Other'];

export function Discover() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getActivities(searchQuery)
      .then(response => setActivities(response.items))
      .catch(error => setError(error instanceof Error ? error.message : 'Activities could not be loaded.'))
      .finally(() => setIsLoading(false));
  }, [searchQuery]);

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = activeCategory === 'All' || activity.category === activeCategory;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover activities</h1>
        <p className="text-secondary-text text-lg">Find something worth joining.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-text" />
          <Input 
            placeholder="Search activities, skills, locations... (Press ⌘K)" 
            className="pl-10 h-12 text-base bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 bg-card">
          <Filter className="mr-2 h-5 w-5" /> Filters
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'secondary'}
            className={cn(
              "rounded-full px-6",
              activeCategory !== cat && "bg-secondary-background hover:bg-card border border-transparent hover:border-border"
            )}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Results Grid */}
      {error ? (
        <div className="text-center py-24 bg-card rounded-xl border border-border mt-8">
          <h3 className="text-xl font-semibold mb-2">Could not load activities</h3>
          <p className="text-secondary-text">{error}</p>
        </div>
      ) : isLoading ? (
        <p className="text-secondary-text py-24 text-center">Loading activities...</p>
      ) : filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card rounded-xl border border-border mt-8">
          <h3 className="text-xl font-semibold mb-2">No activities found</h3>
          <p className="text-secondary-text mb-6">Try adjusting your filters or search terms.</p>
          <Button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
