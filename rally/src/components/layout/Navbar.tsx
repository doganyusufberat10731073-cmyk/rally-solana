import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { api } from '@/api/client';
import type { User } from '@/types';
import { cn } from '@/utils';

interface SolanaWallet {
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string }}>;
  signMessage?: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: SolanaWallet;
  }
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.getMyProfile().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, []);

  const connectWallet = async () => {
    if (!window.solana?.connect || !window.solana.signMessage) {
      window.alert('Install Phantom or another Solana wallet to connect.');
      return;
    }
    setIsConnecting(true);
    try {
      const { publicKey } = await window.solana.connect();
      const user = await api.authenticateWallet(publicKey.toString(), async message => {
        const result = await window.solana!.signMessage!(message, 'utf8');
        return result.signature;
      });
      setCurrentUser(user);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const navLinks = [
    { name: 'Discover', path: '/discover' },
    { name: 'My Activities', path: '/my-activities' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight">RALLY</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary-text",
                    location.pathname === link.path ? "text-primary-text" : "text-secondary-text"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-secondary-text">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-secondary-text relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-accent" />
            </Button>
            
            <Link to="/profile">
              <Avatar className="h-8 w-8 transition-transform hover:scale-105">
                <AvatarFallback className="bg-card text-xs">
                  {currentUser?.username.substring(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
            </Link>

            <Button className="ml-2" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : currentUser ? 'Wallet Connected' : 'Connect Wallet'}
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "block text-sm font-medium p-2 rounded-md transition-colors",
                location.pathname === link.path ? "bg-card text-primary-text" : "text-secondary-text hover:bg-secondary-background hover:text-primary-text"
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-border my-2" />
          <Link to="/profile" className="flex items-center gap-3 p-2" onClick={() => setIsMobileMenuOpen(false)}>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{currentUser?.username.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Profile</span>
          </Link>
          <Button className="w-full mt-2" onClick={connectWallet} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : currentUser ? 'Wallet Connected' : 'Connect Wallet'}
          </Button>
        </div>
      )}
    </nav>
  );
}
