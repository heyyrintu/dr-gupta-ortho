import Seo from '../components/Seo';
import KneeStory from '../sections/KneeStory';
import { AboutTeaser, Cases, ConditionExplorer, CtaBand, Hero, LocationsStrip, Reviews, Services, StatsBand } from '../sections/HomeSections';

export default function Home() {
  return (
    <>
      <Seo
        path="/"
        title="Dr. Siddharth Gupta | Robotic Knee & Hip Replacement Surgeon, Kolkata & Howrah"
        description="Consultant orthopaedic surgeon in Kolkata & Howrah for robotic knee and hip replacement (MAKO, VELYS, CUVIS), sports injuries, arthroscopy, spine and trauma. Book an OPD appointment."
      />
      <Hero />
      <Services />
      <KneeStory />
      <AboutTeaser />
      <StatsBand />
      <ConditionExplorer />
      <LocationsStrip />
      <Reviews />
      <Cases />
      <CtaBand />
    </>
  );
}
