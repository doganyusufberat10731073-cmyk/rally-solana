import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Calendar, Globe, Users, ShieldCheck, User as UserIcon } from 'lucide-react';
import { api } from '@/api/client';
import type { Activity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { useRallyProgram } from '@/hooks/useRallyProgram';
import { getParticipantPda } from '@/services/solana/pda';
import { PublicKey, SystemProgram } from '@solana/web3.js';

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  
  const { program, wallet } = useRallyProgram();

  useEffect(() => {
    if (!id) return;
    api.getActivity(id)
      .then(setActivity)
      .catch(error => setError(error instanceof Error ? error.message : 'Activity could not be loaded.'));
  }, [id]);

  if (error) {
    return <div className="container mx-auto px-4 py-24 text-center"><h1 className="text-3xl font-bold mb-4">{error}</h1><Button asChild><Link to="/discover">Back to Discover</Link></Button></div>;
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Activity not found</h1>
        <Button asChild><Link to="/discover">Back to Discover</Link></Button>
      </div>
    );
  }

  const isJoined = activity.isJoined ?? false;
  const isCreator = activity.isCreator ?? false;
  const isFull = activity.participants.length >= activity.maxParticipants;
  const progressPercent = (activity.participants.length / activity.maxParticipants) * 100;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <Link to="/discover" className="text-sm text-secondary-text hover:text-primary-text transition-colors">
          ← Back to Discover
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary">{activity.category}</Badge>
              {isFull && <Badge variant="destructive">Full</Badge>}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{activity.title}</h1>
            
            <div className="flex flex-wrap gap-6 text-secondary-text">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <span>{activity.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <span>{activity.time} ({activity.duration})</span>
              </div>
              <div className="flex items-center gap-2">
                {activity.isOnline ? <Globe className="h-5 w-5 text-accent" /> : <MapPin className="h-5 w-5 text-accent" />}
                <span>{activity.location}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-lg text-secondary-text leading-relaxed whitespace-pre-wrap">
              {activity.description}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Requirements</h2>
            <ul className="space-y-3">
              {activity.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-secondary-text bg-secondary-background p-4 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg sticky top-24">
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span>Participants</span>
                <span className="text-secondary-text">{activity.participants.length} / {activity.maxParticipants}</span>
              </div>
              <div className="h-2 w-full bg-secondary-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {isCreator ? (
              <Button className="w-full h-12 text-base font-semibold" variant="outline">
                Manage Activity
              </Button>
            ) : isJoined ? (
              <Button className="w-full h-12 text-base font-semibold bg-secondary-background text-primary-text hover:bg-secondary-background" disabled>
                You're in
              </Button>
            ) : isFull ? (
              <Button className="w-full h-12 text-base font-semibold" variant="secondary" disabled>
                Activity Full
              </Button>
            ) : (
              <Button
                className="w-full h-12 text-base font-semibold shadow-accent/20 shadow-lg"
                disabled={isJoining}
                onClick={async () => {
                  try {
                    setIsJoining(true);
                    if (!program || !wallet || !activity.activityPda) {
                      throw new Error("Wallet not connected or Activity missing PDA.");
                    }
                    const activityPda = new PublicKey(activity.activityPda);
                    const participantPda = getParticipantPda(activityPda, wallet.publicKey);
                    
                    const txSignature = await program.methods
                      .joinActivity()
                      .accounts({
                        participant: participantPda,
                        activity: activityPda,
                        user: wallet.publicKey,
                        systemProgram: SystemProgram.programId,
                      })
                      .rpc();

                    const updated = await api.joinActivity(activity.id, {
                      participantPda: participantPda.toString(),
                      txSignature,
                    });
                    setActivity(updated);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not join activity.');
                  } finally {
                    setIsJoining(false);
                  }
                }}
              >
                {isJoining ? 'Joining...' : 'Join Activity'}
              </Button>
            )}

            <div className="mt-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" /> Team
              </h3>
              <div className="space-y-4">
                {activity.participants.map(pId => {
                  const p = activity.participantUsers?.find(participant => participant.id === pId);
                  return (
                    <div key={pId} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{p?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          @{p?.username}
                          {pId === activity.creatorId && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Host</Badge>
                          )}
                        </div>
                        <div className="text-xs text-secondary-text">⭐ {p?.reputation} rep · {p?.activitiesCompleted} activities</div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Empty Slots */}
                {Array.from({ length: activity.maxParticipants - activity.participants.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 opacity-40">
                    <div className="h-10 w-10 rounded-full border border-dashed border-muted-text flex items-center justify-center bg-secondary-background">
                      <UserIcon className="h-4 w-4 text-muted-text" />
                    </div>
                    <div className="text-sm font-medium text-muted-text">Open Slot</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
