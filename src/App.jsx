import { useCallback, useEffect, useState } from 'react';
import { loadLegacyScripts } from './legacy/loadLegacyScripts.js';

import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Funnel from './components/Funnel.jsx';
import CodeSection from './components/CodeSection.jsx';
import NestedOffers from './components/NestedOffers.jsx';
import AiPortfolioExperience from './components/ai-experience/AiPortfolioExperience.jsx';
import Certificate from './components/Certificate.jsx';
import Automation from './components/Automation.jsx';
import FinalButterflyStory from './components/FinalButterflyStory.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import AiAssistantWidget from './components/AiAssistantWidget.jsx';

export default function App() {
  const [assistantPresence, setAssistantPresence] = useState({ visible: false });

  useEffect(() => {
    loadLegacyScripts();
  }, []);

  const handleAssistantPresence = useCallback((key, value) => {
    setAssistantPresence((current) => (
      current[key] === value ? current : { ...current, [key]: value }
    ));
  }, []);

  return (
    <>
      <Nav />
      <Hero />
      <Funnel />
      <CodeSection />
      <NestedOffers />
      <AiPortfolioExperience onPresenceChange={handleAssistantPresence} />
      <Certificate />
      <Automation />
      <FinalButterflyStory />
      <Footer />
      <BackToTop />
      <AiAssistantWidget
        sectionVisible={assistantPresence.visible}
      />
    </>
  );
}
