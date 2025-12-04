// Utility functions for API key management

import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Get current user ID
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

// Generate a secure API key
const generateApiKey = () => {
  // Generate a random 32-byte key and encode as base64
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, (match) => {
    return { '+': '-', '/': '_', '=': '' }[match];
  });
};

// Get all API keys for the current user
export const getApiKeys = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const user_id = await getUserId();
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, key_name, project_name, created_at, last_used_at, is_active')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading API keys:', error);
    throw error;
  }
};

// Create a new API key
export const createApiKey = async (keyName, projectName = null) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const user_id = await getUserId();
    const apiKey = generateApiKey();

    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          user_id,
          key_name: keyName,
          api_key: apiKey,
          project_name: projectName,
          is_active: true,
        },
      ])
      .select('id, key_name, project_name, api_key, created_at')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

// Delete an API key
export const deleteApiKey = async (apiKeyId) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', apiKeyId)
      .eq('user_id', user_id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

// Toggle API key active status
export const toggleApiKeyStatus = async (apiKeyId, isActive) => {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  try {
    const user_id = await getUserId();
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: isActive })
      .eq('id', apiKeyId)
      .eq('user_id', user_id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating API key:', error);
    throw error;
  }
};

