import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Home } from '@/pages/Home';
import { Discover } from '@/pages/Discover';
import { ActivityDetail } from '@/pages/ActivityDetail';
import { CreateActivity } from '@/pages/CreateActivity';
import { MyActivities } from '@/pages/MyActivities';
import { Profile } from '@/pages/Profile';

import { SolanaProvider } from '@/providers/SolanaProvider';

function App() {
  return (
    <SolanaProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-primary-text font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/activity/:id" element={<ActivityDetail />} />
              <Route path="/create" element={<CreateActivity />} />
              <Route path="/my-activities" element={<MyActivities />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SolanaProvider>
  );
}

export default App;
