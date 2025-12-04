// Vercel serverless function to get settings via API key
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-API-Key, Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from header
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required. Provide it via X-API-Key header or api_key query parameter.' });
  }

  // Get project name from query (optional - if not provided, returns all projects)
  const projectName = req.query.project;
  const settingKey = req.query.key; // Optional: get specific setting key

  try {
    // Initialize Supabase client with service role key for admin access
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify API key and get user_id
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('user_id, project_name, key_name')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (apiKeyError || !apiKeyData) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', apiKey);

    const userId = apiKeyData.user_id;
    const apiKeyProjectName = apiKeyData.project_name;

    // Determine which project to query
    const targetProject = projectName || apiKeyProjectName;

    if (!targetProject) {
      // If no project specified and API key doesn't have a project, return all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('name')
        .eq('user_id', userId);

      if (projectsError) {
        return res.status(500).json({ error: 'Failed to fetch projects' });
      }

      return res.status(200).json({
        projects: projects.map(p => p.name),
        message: 'Specify a project name to get settings. Use ?project=ProjectName'
      });
    }

    // Get settings for the specified project
    let query = supabase
      .from('settings')
      .select('key, value')
      .eq('user_id', userId)
      .eq('project_name', targetProject);

    // If specific key requested, filter by it
    if (settingKey) {
      query = query.eq('key', settingKey);
    }

    const { data: settings, error: settingsError } = await query;

    if (settingsError) {
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // If specific key requested, return single value
    if (settingKey) {
      if (settings.length === 0) {
        return res.status(404).json({ error: `Setting key "${settingKey}" not found in project "${targetProject}"` });
      }
      return res.status(200).json({
        project: targetProject,
        key: settingKey,
        value: settings[0].value
      });
    }

    // Return all settings as key-value object
    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });

    return res.status(200).json({
      project: targetProject,
      settings: settingsObject
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

