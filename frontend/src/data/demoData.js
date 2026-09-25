export const demoProfile = {
  name: 'Demo Student',
  education: 'B.E. Computer Science',
  skills: ['Java', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'DSA'],
  targetCareer: 'Software Engineer',
  experienceLevel: 'Intermediate',
  learningHours: 8,
  readiness: {
    overall: 72,
    breakdown: [
      { label: 'Skills', value: 78 },
      { label: 'Projects', value: 70 },
      { label: 'GitHub', value: 62 },
      { label: 'Resume', value: 80 },
      { label: 'Interview', value: 55 },
    ],
  },
  currentFocus: {
    role: 'AI Engineer',
    skill: 'Deep Learning',
    priority: 'Model Deployment',
  },
  actions: [
    'Complete Docker fundamentals',
    'Build REST API project',
    'Solve 3 ML interview questions',
    'Improve GitHub README',
  ],
};

export const mockResume = {
  technicalSkills: ['Java', 'Python', 'React', 'Node.js', 'MongoDB'],
  projects: 3,
  experience: '1 internship',
  education: 'B.E. Computer Science',
  strengths: [
    'Strong technical skills',
    'Relevant projects',
    'Good education section',
  ],
  weaknesses: [
    'Project descriptions lack measurable impact',
    'Missing deployment technologies',
    'Skills section is too broad',
  ],
};

export const skillGraph = [
  { name: 'AI Engineering', children: [
    { name: 'Python', children: ['NumPy', 'Pandas'] },
    { name: 'ML', children: ['Deep Learning', 'NLP'] },
    { name: 'MLOps', children: ['Docker', 'Kubernetes'] },
  ] },
];

export const careerRoles = [
  'Software Engineer',
  'AI Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Full Stack Developer',
  'Product Engineer',
];

export const skillGap = {
  strong: ['Python', 'Git', 'Machine Learning'],
  developing: ['Deep Learning', 'NLP', 'SQL'],
  missing: ['MLOps', 'Docker', 'Model Deployment', 'Vector Databases'],
};

export const roadmap = [
  {
    phase: 'Phase 1',
    title: 'Strengthen Foundations',
    items: ['Python', 'Statistics', 'SQL'],
    description: 'Strengthen the fundamentals behind core software and data work.',
    difficulty: 'Beginner',
    time: '2 weeks',
    prerequisites: ['Basic programming'],
    resources: ['Python docs', 'SQL practice'],
    project: 'Data analysis mini project',
  },
  {
    phase: 'Phase 2',
    title: 'Machine Learning',
    items: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation'],
    description: 'Build practical ML concepts with evaluation and iteration.',
    difficulty: 'Intermediate',
    time: '3 weeks',
    prerequisites: ['Python', 'Statistics'],
    resources: ['Scikit-learn tutorials'],
    project: 'Customer churn predictor',
  },
  {
    phase: 'Phase 3',
    title: 'Deep Learning',
    items: ['Neural Networks', 'CNN', 'Transformers'],
    description: 'Move from classical ML into modern deep learning patterns.',
    difficulty: 'Intermediate',
    time: '4 weeks',
    prerequisites: ['Machine Learning'],
    resources: ['PyTorch docs'],
    project: 'Image classifier',
  },
  {
    phase: 'Phase 4',
    title: 'Deployment',
    items: ['FastAPI', 'Docker', 'Cloud'],
    description: 'Package and ship AI work into a usable service.',
    difficulty: 'Intermediate',
    time: '3 weeks',
    prerequisites: ['Deep Learning'],
    resources: ['Docker fundamentals', 'FastAPI guides'],
    project: 'Deploy an AI API',
  },
];

export const recommendations = [
  { title: 'Learn Docker', reason: 'Your GitHub is strong in frontend and backend work but lacks deployment evidence.', action: 'Build a Dockerized version of one project and document the commands.' },
  { title: 'Improve project documentation', reason: 'Your resume and repo show solid work but documentation quality is still uneven.', action: 'Add README sections, architecture diagrams, and setup instructions.' },
  { title: 'Build a deployment project', reason: 'Deployment is a key gap for AI Engineer roles and is a high-value signal.', action: 'Ship one app with Docker and a public deployment target.' },
  { title: 'Practice system design', reason: 'Interview readiness is below target and system design is often evaluated for advanced roles.', action: 'Review scalable architecture patterns and practice one case per week.' },
];

export const demoAnalysis = {
  summary: 'Your profile already shows a solid foundation in web development and AI-adjacent work. The biggest opportunities are deployment readiness, more polished documentation, and stronger interview preparation for advanced engineering roles.',
  skillAssessment: [
    { name: 'JavaScript', level: 'strong', reason: 'You have a consistent frontend and backend foundation across modern JavaScript tooling.' },
    { name: 'React', level: 'strong', reason: 'Your experience shows strong UI-building habits and component-driven development patterns.' },
    { name: 'Node.js', level: 'developing', reason: 'Backend work is present, but API depth and deployment workflows still need additional proof.' },
    { name: 'Machine Learning', level: 'developing', reason: 'You are moving in the right direction, but practical evaluation and deployment are still the main gaps.' },
    { name: 'Docker', level: 'gap', reason: 'This is a notable missing signal for production-ready AI and software engineering work.' },
    { name: 'System Design', level: 'gap', reason: 'Interview readiness improves when you practice architecture trade-offs and scaling decisions.' },
  ],
  roadmap: roadmap.map((phase, index) => ({
    title: phase.title,
    duration: phase.time,
    objective: phase.description,
    skills: phase.items,
    project: phase.project,
    sequence: index + 1,
  })),
  projects: [
    {
      title: 'AI Resume Analyzer API',
      description: 'Build a full-stack resume analysis service that extracts skills and insights from uploaded documents.',
      skills: ['Node.js', 'REST APIs', 'MongoDB', 'AI APIs', 'Authentication', 'Deployment'],
    },
    {
      title: 'Career Roadmap Dashboard',
      description: 'Show a dynamic skill progression dashboard with adaptive roadmap updates and user tracking.',
      skills: ['React', 'UI Design', 'Charts', 'Analytics'],
    },
    {
      title: 'Deployment-Ready ML Service',
      description: 'Package a small ML project with Docker, CI, and documentation so it is presentation-ready for hiring.',
      skills: ['Docker', 'Python', 'MLOps', 'FastAPI', 'Documentation'],
    },
  ],
  actions: demoProfile.actions,
};

export const githubData = {
  repositories: 18,
  languages: 7,
  activeProjects: 6,
  quality: 74,
  documentation: 62,
  diversity: 81,
  expected: ['React', 'Node.js', 'REST APIs', 'Databases'],
  missing: ['CI/CD', 'Docker'],
};

export const progressData = [
  { name: 'Jan', skills: 35, projects: 30, roadmap: 20, readiness: 38 },
  { name: 'Feb', skills: 50, projects: 42, roadmap: 38, readiness: 46 },
  { name: 'Mar', skills: 62, projects: 54, roadmap: 52, readiness: 60 },
  { name: 'Apr', skills: 72, projects: 66, roadmap: 63, readiness: 72 },
];

export const interviewHistory = [
  { role: 'AI Engineer', type: 'Technical', score: 7.5, summary: 'Good technical understanding, but model evaluation and practical examples need more depth.' },
  { role: 'Software Engineer', type: 'Behavioral', score: 8.4, summary: 'Strong communication and examples.' },
];

export const mentorSuggestions = [
  {
    prompt: 'I only have 6 hours per week. What should I focus on?',
    reply: 'Based on your current AI Engineer roadmap and a 6-hour weekly availability, prioritize machine learning fundamentals and one deployment project. I would postpone advanced Kubernetes until your deployment basics are stronger.',
  },
  {
    prompt: 'How should I improve my GitHub profile?',
    reply: 'Focus on one polished end-to-end project with a clear README, architecture notes, API docs, and deployment notes. This will matter more than spreading your effort across many small repos.',
  },
];
