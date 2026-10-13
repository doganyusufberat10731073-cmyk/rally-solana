import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User as UserIcon, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { SearchModal } from './SearchModal';
import { NotificationsDropdown } from './NotificationsDropdown';
import { api } from '@/api/client';
import type { User } from '@/types';
import { cn } from '@/utils';

interface SolanaWallet {
  publicKey?: { toString: () => string };
  connect: () => Promise<{ publicKey: { toString: () => string }}>;
  disconnect?: () => Promise<void>;
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.getMyProfile()
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);

  // Global shortcut (Cmd+K / Ctrl+K) for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener for User Menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const connectWallet = async () => {
    if (!window.solana?.connect || !window.solana.signMessage) {
      window.alert('Install Phantom or another Solana wallet to connect.');
      return;
    }
    setIsConnecting(true);
    try {
      const { publicKey } = await window.solana.connect();
      const user = await api.authenticateWallet(publicKey.toString(), async (message) => {
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

  const handleLogout = async () => {
    await api.logout();
    if (window.solana?.disconnect) {
      try {
        await window.solana.disconnect();
      } catch {
        // ignore
      }
    }
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Discover', path: '/discover' },
    { name: 'My Activities', path: '/my-activities' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Desktop Nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="text-xl font-bold tracking-tight group-hover:text-accent transition-colors">
                  RALLY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                  DEVNET
                </span>
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
            <div className="hidden md:flex items-center gap-3">
              {/* Search Trigger */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchOpen(true)}
                className="text-secondary-text hover:text-primary-text relative"
                title="Search activities (Ctrl+K)"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications Trigger */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="text-secondary-text hover:text-primary-text relative"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background animate-pulse" />
                  )}
                </Button>

                {/* Notifications Dropdown */}
                <NotificationsDropdown
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                  onUpdateUnreadCount={setUnreadCount}
                  isLoggedIn={Boolean(currentUser)}
                />
              </div>

              {/* User Profile / Menu */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-accent/40 transition-all focus:outline-none"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-card text-xs font-semibold text-accent border border-border">
                        {currentUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-11 z-50 w-56 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-3 border-b border-border/70 bg-secondary-background/40">
                        <p className="text-sm font-semibold text-primary-text truncate">@{currentUser.username}</p>
                        <p className="text-xs font-mono text-secondary-text truncate mt-0.5">
                          {currentUser.walletAddress.slice(0, 4)}...{currentUser.walletAddress.slice(-4)}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-secondary-text hover:text-primary-text hover:bg-secondary-background/80 transition-colors"
                      >
                        <UserIcon className="h-4 w-4" /> View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-destructive hover:bg-destructive/10 transition-colors text-left border-t border-border/60"
                      >
                        <LogOut className="h-4 w-4" /> Disconnect
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/profile" title="Profile">
                  <Avatar className="h-8 w-8 transition-transform hover:scale-105 border border-border/60">
                    <AvatarFallback className="bg-card">
                      <UserIcon className="h-4 w-4 text-secondary-text" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}

              {/* Wallet Button */}
              <Button 
                className={cn("ml-1", currentUser && "border border-accent/40 bg-card hover:bg-secondary-background text-primary-text")}
                onClick={currentUser ? () => setIsUserMenuOpen(!isUserMenuOpen) : connectWallet} 
                disabled={isConnecting}
              >
                {isConnecting ? (
                  'Connecting...'
                ) : currentUser ? (
                  <span className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    {currentUser.walletAddress.slice(0, 4)}...{currentUser.walletAddress.slice(-4)}
                  </span>
                ) : (
                  'Connect Wallet'
                )}
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchOpen(true)}
                className="text-secondary-text"
              >
                <Search className="h-5 w-5" />
              </Button>
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
            <Link 
              to="/profile" 
              className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary-background" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-card">
                  {currentUser ? currentUser.username.substring(0, 2).toUpperCase() : <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {currentUser ? `@${currentUser.username}` : 'Profile'}
              </span>
            </Link>
            <Button 
              className="w-full mt-2" 
              onClick={currentUser ? handleLogout : connectWallet} 
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : currentUser ? 'Disconnect Wallet' : 'Connect Wallet'}
            </Button>
          </div>
        )}
      </nav>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
