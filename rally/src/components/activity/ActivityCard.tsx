import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users } from 'lucide-react';
import type { Activity } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { cn } from '@/utils';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const currentParticipants = activity.participants.length;
  const isFull = currentParticipants >= activity.maxParticipants;
  const spotsLeft = activity.maxParticipants - currentParticipants;

  const getStatusColor = () => {
    if (activity.status === 'Completed') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (activity.status === 'Cancelled') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (isFull) return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    if (spotsLeft <= 2) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    return 'bg-accent/10 text-accent border-accent/20';
  };

  const getStatusText = () => {
    if (activity.status === 'Completed') return 'Completed';
    if (activity.status === 'Cancelled') return 'Cancelled';
    if (isFull) return 'Full';
    return `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`;
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-border hover:shadow-lg hover:-translate-y-1 bg-card">
      <Link to={`/activity/${activity.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Activity</span>
      </Link>
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-secondary-background">
            {activity.category}
          </Badge>
          <Badge variant="outline" className={cn("border", getStatusColor())}>
            {getStatusText()}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-accent transition-colors">
          {activity.title}
        </h3>
        <p className="text-sm text-secondary-text line-clamp-2 mt-1">
          {activity.description}
        </p>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex flex-col gap-2 text-sm text-muted-text">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{activity.date} · {activity.time}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {activity.participants.slice(0, 3).map((participantId, i) => {
              const user = activity.participantUsers?.find(participant => participant.id === participantId);
              return (
                <Avatar key={i} className="h-7 w-7 border-2 border-card">
                  <AvatarFallback className="text-[10px]">
                    {user?.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              );
            })}
            {currentParticipants > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-secondary-background text-[10px] font-medium text-secondary-text">
                +{currentParticipants - 3}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary-text">
            <Users className="h-3 w-3" />
            <span>{currentParticipants} / {activity.maxParticipants}</span>
          </div>
        </div>
        
        <Button 
          variant={isFull ? "secondary" : "default"} 
          size="sm" 
          className="relative z-20"
          disabled={isFull || activity.status !== 'Open'}
        >
          {isFull ? 'Full' : 'Join'}
        </Button>
      </CardFooter>
    </Card>
  );
}
