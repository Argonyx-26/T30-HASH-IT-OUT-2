import { useEffect, useState } from 'react';
import { demoAnalysis, demoProfile } from '../data/demoData';
import { supabase } from './supabase';

const mapDemoProfile = () => ({
  id: 'demo-user',
  full_name: demoProfile.name,
  education: demoProfile.education,
  skills: demoProfile.skills,
  target_career: demoProfile.targetCareer,
  weekly_learning_hours: demoProfile.learningHours,
  experience_level: demoProfile.experienceLevel,
});

export function useProfileData(generateAnalysis = false) {
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      if (!supabase) {
        if (active) {
          setProfile(mapDemoProfile());
          setAnalysis(demoAnalysis);
          setLoading(false);
        }
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (active) {
          setProfile(mapDemoProfile());
          setAnalysis(demoAnalysis);
          setLoading(false);
        }
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, education, skills, target_career, weekly_learning_hours, experience_level, resume_data, ai_analysis')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        if (active) {
          setError(profileError.message);
          setLoading(false);
        }
        return;
      }
      if (!data) {
        if (active) {
          setError('Complete onboarding to create your profile.');
          setLoading(false);
        }
        return;
      }

      const existingAnalysis = data.ai_analysis && Object.keys(data.ai_analysis).length
        ? data.ai_analysis
        : null;
      if (active) {
        setProfile({ ...data, full_name: data.full_name || user.user_metadata?.name || '' });
        setAnalysis(existingAnalysis);
        setLoading(false);
      }

      if (!generateAnalysis || existingAnalysis) return;

      if (active) setGenerating(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Your session expired. Sign in again.');

        const response = await fetch('/api/ai/analyze-profile', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'AI analysis is unavailable.');

        const { error: saveError } = await supabase
          .from('profiles')
          .update({ ai_analysis: result.analysis, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (saveError) throw saveError;
        if (active) setAnalysis(result.analysis);
      } catch (analysisError) {
        if (active) setError(analysisError.message || 'AI analysis is unavailable.');
      } finally {
        if (active) setGenerating(false);
      }
    };

    load();
    return () => { active = false; };
  }, [generateAnalysis]);

  return { profile, analysis, loading, generating, error };
}