import React, { useState, useEffect } from 'react';
import ProjectSelector from './components/ProjectSelector';
import SettingForm from './components/SettingForm';
import SettingsList from './components/SettingsList';
import {
  getProjects,
  getProjectSettings,
  createProject,
  saveProjectSettings,
  saveSetting,
  deleteSetting,
  deleteProject as deleteProjectStorage,
} from './utils/storage';
import { isSupabaseConfigured } from './lib/supabase';

function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState('');
  const [settings, setSettings] = useState({});
  const [editingSetting, setEditingSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedProjects = await getProjects();

        if (loadedProjects.length > 0) {
          setProjects(loadedProjects);
          setCurrentProject(loadedProjects[0]);
          // Load settings for first project
          const loadedSettings = await getProjectSettings(loadedProjects[0]);
          setSettings(loadedSettings);
        } else {
          // Create default project if none exist
          const defaultProject = 'Default Project';
          await createProject(defaultProject);
          setProjects([defaultProject]);
          setCurrentProject(defaultProject);
          setSettings({});
        }
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects. Please check your Supabase configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Load settings when project changes
  useEffect(() => {
    const loadSettings = async () => {
      if (currentProject) {
        try {
          setError(null);
          const loadedSettings = await getProjectSettings(currentProject);
          setSettings(loadedSettings);
          setEditingSetting(null);
        } catch (err) {
          console.error('Error loading settings:', err);
          setError('Failed to load settings for this project.');
        }
      }
    };

    loadSettings();
  }, [currentProject]);

  const handleSelectProject = (projectName) => {
    setCurrentProject(projectName);
  };

  const handleAddProject = async (projectName) => {
    if (!projects.includes(projectName)) {
      try {
        setError(null);
        await createProject(projectName);
        const newProjects = [...projects, projectName];
        setProjects(newProjects);
        setCurrentProject(projectName);
        setSettings({});
      } catch (err) {
        console.error('Error creating project:', err);
        setError(`Failed to create project: ${err.message}`);
      }
    }
  };

  const handleDeleteProject = async (projectName) => {
    try {
      setError(null);
      await deleteProjectStorage(projectName);
      const newProjects = projects.filter(p => p !== projectName);
      setProjects(newProjects);

      if (currentProject === projectName) {
        if (newProjects.length > 0) {
          setCurrentProject(newProjects[0]);
        } else {
          // Create default project if all deleted
          const defaultProject = 'Default Project';
          await createProject(defaultProject);
          setProjects([defaultProject]);
          setCurrentProject(defaultProject);
          setSettings({});
        }
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(`Failed to delete project: ${err.message}`);
    }
  };

  const handleSaveSetting = async (setting) => {
    try {
      setError(null);
      
      // If editing and key changed, delete old setting first
      if (editingSetting && editingSetting.key !== setting.key) {
        await deleteSetting(currentProject, editingSetting.key);
      }
      
      // Save the new/updated setting
      await saveSetting(currentProject, setting.key, setting.value);
      
      // Update local state
      const newSettings = { ...settings };
      if (editingSetting && editingSetting.key !== setting.key) {
        delete newSettings[editingSetting.key];
      }
      newSettings[setting.key] = setting.value;
      setSettings(newSettings);
      setEditingSetting(null);
    } catch (err) {
      console.error('Error saving setting:', err);
      setError(`Failed to save setting: ${err.message}`);
    }
  };

  const handleEditSetting = (setting) => {
    setEditingSetting(setting);
  };

  const handleDeleteSetting = async (key) => {
    try {
      setError(null);
      await deleteSetting(currentProject, key);
      
      // Update local state
      const newSettings = { ...settings };
      delete newSettings[key];
      setSettings(newSettings);
      
      if (editingSetting && editingSetting.key === key) {
        setEditingSetting(null);
      }
    } catch (err) {
      console.error('Error deleting setting:', err);
      setError(`Failed to delete setting: ${err.message}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingSetting(null);
  };

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();
  
  if (!supabaseConfigured) {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Configuration Required</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 mb-2">
              <strong>Supabase is not configured.</strong>
            </p>
            <p className="text-yellow-700 text-sm mb-4">
              To use this application, you need to set up your Supabase credentials.
            </p>
            
            {/* Debug info */}
            <div className="bg-gray-100 rounded p-3 mb-4 text-xs font-mono">
              <p><strong>Debug Info:</strong></p>
              <p>VITE_SUPABASE_URL: {envUrl ? '✓ Set (' + envUrl.substring(0, 30) + '...)' : '✗ Not set'}</p>
              <p>VITE_SUPABASE_ANON_KEY: {envKey ? '✓ Set (' + envKey.substring(0, 20) + '...)' : '✗ Not set'}</p>
            </div>
            
            <ol className="list-decimal list-inside text-yellow-700 text-sm space-y-2">
              <li>Create a new project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
              <li>Run the SQL script from <code className="bg-yellow-100 px-1 rounded">supabase/schema.sql</code> in your Supabase SQL Editor</li>
              <li>Get your project URL and anon key from Settings → API</li>
              <li>Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in the root directory with:
                <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </pre>
                <p className="text-yellow-700 text-xs mt-2">
                  <strong>Important:</strong> Make sure there are no quotes around the values, no spaces around the = sign, and no trailing spaces.
                </p>
              </li>
              <li><strong>Restart the development server</strong> after creating/updating the .env file (Ctrl+C then npm run dev)</li>
            </ol>
          </div>
          <p className="text-gray-600 text-sm">
            See the <code className="bg-gray-100 px-1 rounded">README.md</code> file for detailed instructions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Save My Settings</h1>
          <p className="text-gray-600">Manage integration settings for your projects</p>
        </header>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {currentProject && (
          <>
            <ProjectSelector
              projects={projects}
              currentProject={currentProject}
              onSelectProject={handleSelectProject}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
            />

            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Project: <span className="text-blue-600">{currentProject}</span>
              </h2>
            </div>

            <SettingForm
              setting={editingSetting}
              onSave={handleSaveSetting}
              onCancel={editingSetting ? handleCancelEdit : null}
            />

            <SettingsList
              settings={settings}
              onEdit={handleEditSetting}
              onDelete={handleDeleteSetting}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
