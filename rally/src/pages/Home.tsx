import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Activity as ActivityIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { api } from '@/api/client';
import type { Activity } from '@/types';

export function Home() {
  const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getFeaturedActivities()
      .then(activities => setFeaturedActivities(activities.slice(0, 3)))
      .catch(error => setError(error instanceof Error ? error.message : 'Activities could not be loaded.'));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-background to-background pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
            >
              Find people.<br />
              Form a team.<br />
              <span className="text-accent">Do things.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-secondary-text mb-10 max-w-2xl mx-auto"
            >
              Whatever you're trying to do, find the people to do it with. Create an activity, find the people you need, and turn an idea into something real.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                <Link to="/discover">Explore activities <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base">
                <Link to="/create">Create an activity</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories & Core Flow */}
      <section className="py-20 bg-secondary-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-secondary-text max-w-2xl mx-auto">
              From gaming sessions to hackathon teams, Rally is the coordination layer for your activities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create', desc: 'Post what you want to do.' },
              { step: '02', title: 'Discover', desc: 'Find activities that match your interests.' },
              { step: '03', title: 'Join', desc: 'Apply or instantly join open slots.' },
              { step: '04', title: 'Do it together', desc: 'Meet up online or in person.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border">
                <span className="text-4xl font-bold text-accent/20 mb-4">{item.step}</span>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-secondary-text text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Activities Showcase */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Happening now</h2>
              <p className="text-secondary-text">Join these open activities right now.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link to="/discover">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          
          {error ? (
            <p className="text-secondary-text">{error}</p>
          ) : featuredActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-secondary-text">Loading activities...</p>
          )}
          
          <Button variant="outline" asChild className="w-full mt-8 md:hidden">
            <Link to="/discover">View all activities</Link>
          </Button>
        </div>
      </section>

      {/* Solana Trust Section */}
      <section className="py-24 bg-card border-t border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Built for trust.</h2>
            <p className="text-secondary-text text-lg">
              Rally uses Solana to make participation and reputation verifiable, while keeping the experience simple for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wallet Identity</h3>
              <p className="text-secondary-text">Your wallet is your identity. No passwords to remember, just seamless cryptographic authentication.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent">
                <ActivityIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verifiable Participation</h3>
              <p className="text-secondary-text">On-chain proofs guarantee that when someone says they participated, they actually did.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-accent">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Reputation</h3>
              <p className="text-secondary-text">Build a portable history of reliability. Good actors are rewarded with a trustworthy profile.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
