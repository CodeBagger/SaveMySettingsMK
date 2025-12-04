import React, { useState, useEffect } from 'react';
import { getApiKeys, createApiKey, deleteApiKey, toggleApiKeyStatus } from '../utils/apiKeys';
import { getProjects } from '../utils/storage';

function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [newApiKey, setNewApiKey] = useState(null); // Store newly created key to show once
  const [copiedKeyId, setCopiedKeyId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [keys, projs] = await Promise.all([
        getApiKeys(),
        getProjects(),
      ]);
      setApiKeys(keys);
      setProjects(projs);
    } catch (err) {
      console.error('Error loading API keys:', err);
      setError('Failed to load API keys. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key.');
      return;
    }

    try {
      setError(null);
      const projectName = selectedProject || null;
      const data = await createApiKey(newKeyName.trim(), projectName);
      setNewApiKey(data);
      setNewKeyName('');
      setSelectedProject('');
      setShowCreateForm(false);
      await loadData();
    } catch (err) {
      console.error('Error creating API key:', err);
      setError(`Failed to create API key: ${err.message}`);
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await deleteApiKey(keyId);
      await loadData();
    } catch (err) {
      console.error('Error deleting API key:', err);
      setError(`Failed to delete API key: ${err.message}`);
    }
  };

  const handleToggleStatus = async (keyId, currentStatus) => {
    try {
      setError(null);
      await toggleApiKeyStatus(keyId, !currentStatus);
      await loadData();
    } catch (err) {
      console.error('Error updating API key:', err);
      setError(`Failed to update API key: ${err.message}`);
    }
  };

  const copyToClipboard = (text, keyId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-gray-600">Loading API keys...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">API Keys</h2>
        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create API Key
          </button>
        )}
      </div>

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

      {/* Show newly created API key */}
      {newApiKey && (
        <div className="mb-4 bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="font-semibold mb-2">⚠️ Important: Save this API key now!</p>
          <p className="text-sm mb-2">You won't be able to see it again after closing this message.</p>
          <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm break-all mb-2">
            {newApiKey.api_key}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(newApiKey.api_key, 'new')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              {copiedKeyId === 'new' ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => setNewApiKey(null)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateApiKey} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
                Key Name *
              </label>
              <input
                id="keyName"
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                required
                placeholder="e.g., Production API Key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                Project (Optional)
              </label>
              <select
                id="project"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                If specified, this API key will only have access to settings in the selected project.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create API Key
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName('');
                  setSelectedProject('');
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {apiKeys.length === 0 ? (
        <p className="text-gray-600">No API keys created yet. Create one to get started.</p>
      ) : (
        <div className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{key.key_name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        key.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {key.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {key.project_name && (
                    <p className="text-sm text-gray-600 mb-1">
                      Project: <span className="font-medium">{key.project_name}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(key.created_at)} | Last used: {formatDate(key.last_used_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(key.id, key.is_active)}
                    className={`px-3 py-1 rounded text-sm ${
                      key.is_active
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {key.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteApiKey(key.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">How to use API keys:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Create an API key and copy it (you'll only see it once!)</li>
          <li>Use it in API requests with the <code className="bg-blue-100 px-1 rounded">X-API-Key</code> header</li>
          <li>Example: <code className="bg-blue-100 px-1 rounded">GET /api/get-settings?project=MyProject</code></li>
        </ol>
      </div>
    </div>
  );
}

export default ApiKeysManager;

