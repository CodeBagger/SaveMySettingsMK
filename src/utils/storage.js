// Utility functions for Supabase persistence

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Get current user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

// Get all projects
export const getProjects = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    // RLS will automatically filter by user_id
    const { data, error } = await supabase
      .from('projects')
      .select('name')
      .order('name');

    if (error) throw error;
    return data.map(project => project.name);
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
};

// Get all settings for a project
export const getProjectSettings = async (projectName) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    // RLS will automatically filter by user_id
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('project_name', projectName);

    if (error) throw error;

    // Convert array to object
    const settingsObject = {};
    data.forEach(setting => {
      settingsObject[setting.key] = setting.value;
    });

    return settingsObject;
  } catch (error) {
    console.error('Error loading project settings:', error);
    return {};
  }
};

// Create a new project
export const createProject = async (projectName) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('projects')
      .insert([{ name: projectName, user_id }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Delete a project and all its settings
export const deleteProject = async (projectName) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    // RLS will automatically filter by user_id, so we can delete by project_name
    // Settings will be cascade deleted by foreign key constraint
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('name', projectName);

    if (projectError) throw projectError;
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// Save a single setting (insert or update)
export const saveSetting = async (projectName, key, value) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('settings')
      .upsert(
        {
          project_name: projectName,
          user_id: user_id,
          key: key,
          value: value,
        },
        {
          onConflict: 'user_id,project_name,key',
        }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
};

// Delete a single setting
export const deleteSetting = async (projectName, key) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    // RLS will automatically filter by user_id
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('project_name', projectName)
      .eq('key', key);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
};

// Save all settings for a project (used for bulk operations)
export const saveProjectSettings = async (projectName, settings) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  
  try {
    const user_id = await getUserId();
    
    // Convert settings object to array
    const settingsArray = Object.entries(settings).map(([key, value]) => ({
      project_name: projectName,
      user_id: user_id,
      key,
      value,
    }));

    // Delete existing settings for this project
    // RLS will automatically filter by user_id
    const { error: deleteError } = await supabase
      .from('settings')
      .delete()
      .eq('project_name', projectName);

    if (deleteError) throw deleteError;

    // Insert new settings if any
    if (settingsArray.length > 0) {
      const { error: insertError } = await supabase
        .from('settings')
        .insert(settingsArray);

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error saving project settings:', error);
    throw error;
  }
};
