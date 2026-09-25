import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import mammoth from 'mammoth';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  : null;
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    const extension = file.originalname.toLowerCase().split('.').pop();
    if (!['pdf', 'docx'].includes(extension)) {
      return callback(new Error('Upload a PDF or DOCX resume.'));
    }
    return callback(null, true);
  },
});

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SkillPilot API is running',
    supabaseConfigured: Boolean(supabase),
    aiConfigured: Boolean(gemini),
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if ([name, email, password].some((value) => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  if (!supabase) {
    return res.status(503).json({ message: 'Supabase is not configured. Check the backend environment.' });
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { name: name.trim() } },
  });

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(201).json({
    message: data.session ? 'Account created successfully.' : 'Check your email to confirm your account.',
    user: data.user,
    session: data.session,
    confirmationRequired: !data.session,
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (!supabase) {
    return res.status(503).json({ message: 'Supabase is not configured. Check the backend environment.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  return res.json({ message: 'Login successful.', user: data.user, session: data.session });
});

app.post('/api/resume/extract', (req, res, next) => {
  resumeUpload.single('resume')(req, res, (error) => {
    if (error) {
      const status = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: status === 413 ? 'Resume must be 10 MB or smaller.' : error.message });
    }
    return next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Choose a PDF or DOCX resume to upload.' });
  }
  if (!supabase || !gemini) {
    return res.status(503).json({ message: 'Resume extraction is not configured.' });
  }

  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!accessToken) {
    return res.status(401).json({ message: 'Sign in to import a resume.' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please sign in again.' });
  }

  const extension = req.file.originalname.toLowerCase().split('.').pop();
  const prompt = [
    'Extract profile information from this resume and return only a JSON object with keys education, educationOther, skills, targetCareer, and experienceLevel.',
    'education must be exactly one of Computer Science, Data Science, Information Technology, Engineering, Business, or Other. If the resume names another field of study, use Other and put its name in educationOther.',
    'skills must be an array of technical skills explicitly supported by the resume.',
    'targetCareer must be exactly one of Software Engineer, AI Engineer, Data Scientist, DevOps Engineer, Full Stack Developer, Product Engineer, or Cybersecurity Engineer, based on explicit goals or the strongest evidence in the resume. Use an empty string if unclear.',
    'experienceLevel must be Beginner, Intermediate, or Advanced based on explicit work and project experience. Use an empty string if there is not enough evidence.',
    'Do not infer weekly learning hours, contact details, or other personal information.',
  ].join(' ');

  try {
    let contents;
    if (extension === 'pdf') {
      if (req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
        return res.status(400).json({ message: 'This file is not a valid PDF.' });
      }
      contents = [
        { inlineData: { mimeType: 'application/pdf', data: req.file.buffer.toString('base64') } },
        { text: prompt },
      ];
    } else {
      if (req.file.buffer.subarray(0, 2).toString() !== 'PK') {
        return res.status(400).json({ message: 'This file is not a valid DOCX document.' });
      }
      const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
      if (!value.trim()) {
        return res.status(400).json({ message: 'No readable text was found in this resume.' });
      }
      contents = `${prompt}\n\nResume text:\n${value.slice(0, 30000)}`;
    }

    const result = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents,
      config: { responseMimeType: 'application/json' },
    });
    const extracted = JSON.parse(result.text || '{}');
    const validCareers = ['Software Engineer', 'AI Engineer', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer', 'Product Engineer', 'Cybersecurity Engineer'];
    const validExperience = ['Beginner', 'Intermediate', 'Advanced'];

    return res.json({
      extracted: {
        education: ['Computer Science', 'Data Science', 'Information Technology', 'Engineering', 'Business', 'Other'].includes(extracted.education) ? extracted.education : '',
        educationOther: typeof extracted.educationOther === 'string' ? extracted.educationOther.slice(0, 120) : '',
        skills: Array.isArray(extracted.skills)
          ? [...new Set(extracted.skills.filter((skill) => typeof skill === 'string').map((skill) => skill.trim()).filter(Boolean))].slice(0, 30)
          : [],
        targetCareer: validCareers.includes(extracted.targetCareer) ? extracted.targetCareer : '',
        experienceLevel: validExperience.includes(extracted.experienceLevel) ? extracted.experienceLevel : '',
      },
    });
  } catch (error) {
    console.error('Resume extraction failed:', error.status ?? error.name);
    return res.status(502).json({ message: 'Resume extraction failed. You can continue onboarding manually.' });
  }
});

app.post('/api/mentor/chat', async (req, res) => {
  const { message, history = [] } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
    return res.status(400).json({ message: 'Enter a message of up to 4,000 characters.' });
  }
  if (!supabase) {
    return res.status(503).json({ message: 'Supabase is not configured. Check the backend environment.' });
  }
  if (!gemini) {
    return res.status(503).json({ message: 'AI mentor is not configured. Check GEMINI_API_KEY.' });
  }

  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!accessToken) {
    return res.status(401).json({ message: 'Sign in to use the AI mentor.' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please sign in again.' });
  }

  const conversation = Array.isArray(history)
    ? history.slice(-8).filter((item) => (
      (item?.role === 'user' || item?.role === 'assistant')
      && typeof item.content === 'string'
      && item.content.length <= 4000
    ))
    : [];

  try {
    const completion = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: [
        ...conversation.map((item) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        })),
        { role: 'user', parts: [{ text: message.trim() }] },
      ],
      config: {
        systemInstruction: 'You are SkillPilot, a practical and supportive career mentor for students and early-career developers. Give specific, actionable advice.',
      },
    });
    const reply = completion.text?.trim();
    if (!reply) {
      return res.status(502).json({ message: 'The AI mentor returned an empty response. Please try again.' });
    }
    return res.json({ reply });
  } catch (error) {
    console.error('Gemini mentor request failed:', error.status ?? error.name);
    return res.status(502).json({ message: 'The AI mentor could not respond. Check the Gemini API key and try again.' });
  }
});

app.post('/api/ai/analyze-profile', async (req, res) => {
  if (!supabase || !gemini) {
    return res.status(503).json({ message: 'AI profile analysis is not configured.' });
  }

  const authorization = req.headers.authorization;
  const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!accessToken) {
    return res.status(401).json({ message: 'Sign in to generate your profile analysis.' });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) {
    return res.status(401).json({ message: 'Your session is invalid or expired. Please sign in again.' });
  }

  try {
    const userSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile, error: profileError } = await userSupabase
      .from('profiles')
      .select('education, skills, target_career, weekly_learning_hours, experience_level')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile || (!profile.education && !profile.skills?.length && !profile.target_career)) {
      return res.status(409).json({ message: 'Complete onboarding or import a resume before generating your analysis.' });
    }

    const prompt = [
      'Create personalized career guidance using only the supplied profile. Do not claim that you inspected a resume, GitHub, or work history unless those details appear below.',
      'Return JSON with: summary (string), skillAssessment (array of {name, level, reason}, where level is strong, developing, or gap), roadmap (array of {title, duration, objective, skills, project}), projects (array of {title, description, skills}), and actions (array of short strings).',
      'Keep the roadmap to 4 phases, projects to 3, and actions to 5. Do not invent scores, percentages, or personal facts. If evidence is limited, state that briefly in the summary.',
      `Profile: ${JSON.stringify({ education: profile.education, skills: profile.skills, targetCareer: profile.target_career, weeklyLearningHours: profile.weekly_learning_hours, experienceLevel: profile.experience_level })}`,
    ].join('\n');

    const result = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const analysis = JSON.parse(result.text || '{}');
    const text = (value, maxLength = 500) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
    const textList = (value, maxItems = 12) => Array.isArray(value)
      ? value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, maxItems)
      : [];

    return res.json({
      analysis: {
        summary: text(analysis.summary, 1200),
        skillAssessment: Array.isArray(analysis.skillAssessment)
          ? analysis.skillAssessment.slice(0, 30).filter((item) => item && typeof item.name === 'string').map((item) => ({
            name: text(item.name, 80),
            level: ['strong', 'developing', 'gap'].includes(item.level) ? item.level : 'developing',
            reason: text(item.reason),
          }))
          : [],
        roadmap: Array.isArray(analysis.roadmap)
          ? analysis.roadmap.slice(0, 4).filter((item) => item && typeof item.title === 'string').map((item) => ({
            title: text(item.title, 100),
            duration: text(item.duration, 40),
            objective: text(item.objective),
            skills: textList(item.skills),
            project: text(item.project, 160),
          }))
          : [],
        projects: Array.isArray(analysis.projects)
          ? analysis.projects.slice(0, 3).filter((item) => item && typeof item.title === 'string').map((item) => ({
            title: text(item.title, 100),
            description: text(item.description),
            skills: textList(item.skills),
          }))
          : [],
        actions: textList(analysis.actions, 5),
      },
    });
  } catch (error) {
    console.error('Profile analysis failed:', error.status ?? error.name);
    return res.status(502).json({ message: 'AI analysis is temporarily unavailable. Please try again later.' });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

app.listen(PORT, () => {
  console.log(`SkillPilot backend running on http://localhost:${PORT}`);
});
