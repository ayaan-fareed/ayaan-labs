import Loader from "@/components/common/Loader";
import ExperienceCanvas from "@/components/experience/ExperienceCanvas";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import ProjectShowcase from "@/components/projects/ProjectShowcase";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Loader />
      <ExperienceCanvas />
      <main className="site-shell">
        <Hero />
        <Intro />
        <About />
        <Skills />
        <ProjectShowcase />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
