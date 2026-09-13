import React, { useEffect, useState } from 'react';
import { Star, History, UserCheck, Wallet, Trophy } from 'lucide-react';
import { api } from '@/api/client';
import type { Activity, User } from '@/types';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';

export function Profile() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getMyProfile(), api.getMyActivities('completed')])
      .then(([user, activities]) => {
        setCurrentUser(user);
        setCompletedActivities(activities);
      })
      .catch(error => setError(error instanceof Error ? error.message : 'Profile could not be loaded.'));
  }, []);

  if (error) return <div className="container mx-auto px-4 py-24 text-center"><h1 className="text-3xl font-bold mb-4">{error}</h1><p className="text-secondary-text">Connect your wallet to view your profile.</p></div>;
  if (!currentUser) return <div className="container mx-auto px-4 py-24 text-center text-secondary-text">Loading profile...</div>;
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Sidebar - Identity */}
        <div className="space-y-6">
          <Card className="text-center pt-8">
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-secondary-background">
                <AvatarFallback className="text-2xl">{currentUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">@{currentUser.username}</h1>
              <p className="text-secondary-text mt-2 text-sm max-w-xs">{currentUser.bio}</p>
              
              <div className="flex items-center gap-2 mt-6 bg-secondary-background px-4 py-2 rounded-lg border border-border w-full justify-center">
                <Wallet className="h-4 w-4 text-accent" />
                <span className="font-mono text-sm">{currentUser.walletAddress}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-secondary-text uppercase tracking-wider">Badges</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {currentUser.badges.map((badge, i) => (
                <Badge key={i} variant="secondary" className="bg-secondary-background border border-border text-xs">
                  {badge}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Reputation & Stats */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-6">Reputation</h2>
            <Card className="bg-gradient-to-br from-card to-card border border-border overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="w-32 h-32" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-end gap-4 mb-6">
                  <div className="text-6xl font-bold text-accent">{currentUser.reputation.toFixed(1)}</div>
                  <div className="text-secondary-text mb-1 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-accent text-accent" /> Top 5% of users
                  </div>
                </div>

                <div className="w-full bg-secondary-background rounded-full h-2 mb-2 overflow-hidden">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${(currentUser.reputation / 5) * 100}%` }} />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div>
                    <div className="text-2xl font-semibold mb-1">{currentUser.activitiesCompleted}</div>
                    <div className="text-xs text-secondary-text uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="h-3 w-3" /> Activities
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold mb-1">{currentUser.attendanceRate}%</div>
                    <div className="text-xs text-secondary-text uppercase tracking-wider flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> Attendance
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold mb-1">{currentUser.peopleMet}</div>
                    <div className="text-xs text-secondary-text uppercase tracking-wider flex items-center gap-1">
                      <History className="h-3 w-3" /> People met
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Category Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Gaming', score: 4.9 },
                { name: 'Sports', score: 4.7 },
                { name: 'Development', score: 5.0 },
                { name: 'Social', score: 4.5 }
              ].map(cat => (
                <Card key={cat.name} className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-xl font-semibold text-accent mb-1">{cat.score}</div>
                  <div className="text-xs text-secondary-text font-medium">{cat.name}</div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Recent History</h2>
            {completedActivities.length > 0 ? (
              <div className="space-y-4">
                {completedActivities.map(activity => (
                  <Card key={activity.id} className="p-4 hover:border-border transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{activity.title}</h4>
                        <div className="text-sm text-secondary-text mt-1">{activity.category} · {activity.date}</div>
                      </div>
                      <Badge variant="outline" className="border-blue-500/20 text-blue-500 bg-blue-500/10">Completed</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-secondary-text">
                No completed activities yet.
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
