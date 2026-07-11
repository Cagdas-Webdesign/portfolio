import { useEffect } from 'react';
import { loadLegacyScripts } from './legacy/loadLegacyScripts.js';

import Cursor from './components/Cursor.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Funnel from './components/Funnel.jsx';
import CodeSection from './components/CodeSection.jsx';
import Experience from './components/Experience.jsx';
import NestedOffers from './components/NestedOffers.jsx';
import AiAssistant from './components/AiAssistant.jsx';
import Certificate from './components/Certificate.jsx';
import SocialLottie from './components/SocialLottie.jsx';
import ReelsShowcase from './components/ReelsShowcase.jsx';
import SystemStory from './components/SystemStory.jsx';
import Automation from './components/Automation.jsx';
import ContentEngine from './components/ContentEngine.jsx';
import Contact from './components/Contact.jsx';
import AiAssistantWidget from './components/AiAssistantWidget.jsx';

export default function App() {
  useEffect(() => {
    loadLegacyScripts();
  }, []);

  return (
    <>
      <Cursor />
      <Nav />
      <Hero />
      <Funnel />
      <CodeSection />
      <Experience />
      <NestedOffers />
      <AiAssistant />
      <Certificate />
      <SocialLottie />
      <ReelsShowcase />
      <SystemStory />
      <Automation />
      <ContentEngine />
      <Contact />
      <AiAssistantWidget />
    </>
  );
}
