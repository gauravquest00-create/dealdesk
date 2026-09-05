import React from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { Hero } from '../components/Hero.jsx';
import { Features } from '../components/Features.jsx';
import { HowItWorks } from '../components/HowItWorks.jsx';
import { Pricing } from '../components/Pricing.jsx';
import { FAQ } from '../components/FAQ.jsx';
import { Footer } from '../components/Footer.jsx';
import './HomePage.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main className="home-main">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};