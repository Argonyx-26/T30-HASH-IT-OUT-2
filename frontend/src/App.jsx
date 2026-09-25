import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import ResumePage from './pages/ResumePage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import InterviewPage from './pages/InterviewPage';
import SkillsPage from './pages/SkillsPage';
import CareersPage from './pages/CareersPage';
import SkillGapPage from './pages/SkillGapPage';
import RoadmapPage from './pages/RoadmapPage';
import ProjectsPage from './pages/ProjectsPage';
import GithubPage from './pages/GithubPage';
import MentorPage from './pages/MentorPage';
import SettingsPage from './pages/SettingsPage';

const withLayout = (Component) => (
  <Layout>
    <Component />
  </Layout>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={withLayout(DashboardPage)} />
      <Route path="/resume" element={withLayout(ResumePage)} />
      <Route path="/resume-builder" element={withLayout(ResumeBuilderPage)} />
      <Route path="/skills" element={withLayout(SkillsPage)} />
      <Route path="/careers" element={withLayout(CareersPage)} />
      <Route path="/skill-gap" element={withLayout(SkillGapPage)} />
      <Route path="/roadmap" element={withLayout(RoadmapPage)} />
      <Route path="/projects" element={withLayout(ProjectsPage)} />
      <Route path="/github" element={withLayout(GithubPage)} />
      <Route path="/mentor" element={withLayout(MentorPage)} />
      <Route path="/interview" element={withLayout(InterviewPage)} />
      <Route path="/settings" element={withLayout(SettingsPage)} />
    </Routes>
  );
}
