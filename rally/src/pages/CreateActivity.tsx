import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { api } from '@/api/client';
import type { Category } from '@/types';
import { useRallyProgram } from '@/hooks/useRallyProgram';
import { getActivityPda } from '@/services/solana/pda';
import { BN } from '@coral-xyz/anchor';
import { SystemProgram, PublicKey } from '@solana/web3.js';

export function CreateActivity() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdActivityId, setCreatedActivityId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { program, wallet } = useRallyProgram();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      const activePublicKey = wallet?.publicKey || (window as any).solana?.publicKey;
      if (!activePublicKey) {
        throw new Error("Wallet not connected. Please click 'Connect Wallet' in top right.");
      }
      if (!program) {
        throw new Error("Solana Devnet connection is initializing. Please try again.");
      }

      const creatorPubkey = new PublicKey(activePublicKey.toString());
      const activityId = new BN(Math.floor(Math.random() * 1_000_000_000));
      const maxParticipants = Number(formData.get('maxParticipants'));
      
      const activityPda = getActivityPda(creatorPubkey, BigInt(activityId.toString()));
      
      const txSignature = await program.methods
        .createActivity(activityId, maxParticipants)
        .accounts({
          activity: activityPda,
          creator: creatorPubkey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const activity = await api.createActivity({
        title: String(formData.get('title')),
        description: String(formData.get('description')),
        category: String(formData.get('category')) as Category,
        location: String(formData.get('location')),
        date: String(formData.get('date')),
        time: String(formData.get('time')),
        duration: String(formData.get('duration')),
        maxParticipants,
        requirements: String(formData.get('requirements') || '').split(',').map(item => item.trim()).filter(Boolean),
        isOnline: formData.get('locationType') === 'Online',
        solanaActivityId: activityId.toString(),
        activityPda: activityPda.toString(),
        txSignature,
      });
      setCreatedActivityId(activity.id);
      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Activity could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-accent/20 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-accent" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Your activity is live.</h1>
        <p className="text-xl text-secondary-text mb-10">
          Share it with people and start building your team.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="h-12 px-8">
            Share Link
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8" asChild>
            <Link to={`/activity/${createdActivityId}`}>View activity</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3">Create an activity</h1>
        <p className="text-secondary-text text-lg">Tell people what you're looking to do.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <label className="block text-sm font-medium">Activity title</label>
            <Input name="title" placeholder="e.g., CS2 Premier - Need 2 players" required />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Gaming', 'Sports', 'Development', 'Learning', 'Creative', 'Social', 'Other'].map(cat => (
                <label key={cat} className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary-background transition-colors">
                  <input type="radio" name="category" value={cat} className="accent-accent" required />
                  <span className="text-sm">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium">Description</label>
            <textarea 
              className="flex w-full rounded-md border border-border bg-secondary-background px-3 py-2 text-sm placeholder:text-muted-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[120px]"
              placeholder="What are you planning? Who are you looking for?"
              name="description"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium">Location Type</label>
              <select name="locationType" className="flex h-10 w-full rounded-md border border-border bg-secondary-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <option>Online</option>
                <option>In person</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium">City / Area (if in person)</label>
              <Input name="location" placeholder="e.g., Ankara, Merkez Park" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium">Date</label>
              <Input name="date" type="date" required />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium">Time</label>
              <Input name="time" type="time" required />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium">Duration</label>
              <Input name="duration" placeholder="e.g., 2 hours" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium">People needed</label>
              <Input name="maxParticipants" type="number" min="2" max="100" placeholder="e.g., 2" required />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium">Requirements</label>
              <Input name="requirements" placeholder="e.g., Mic required, 18+" />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 px-8 shadow-accent/20 shadow-lg">
              {isSubmitting ? 'Creating...' : 'Create activity'} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

        </form>
      </Card>
    </div>
  );
}
