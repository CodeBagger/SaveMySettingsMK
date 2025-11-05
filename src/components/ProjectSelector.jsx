import React, { useState } from 'react';

function ProjectSelector({ projects, currentProject, onSelectProject, onAddProject, onDeleteProject }) {
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (newProjectName.trim() && !projects.includes(newProjectName.trim())) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {projects.map((project) => (
          <div
            key={project}
            className={`px-4 py-2 rounded-lg cursor-pointer transition-all ${
              currentProject === project
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onSelectProject(project)}
          >
            <div className="flex items-center gap-2">
              <span>{project}</span>
              {projects.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete project "${project}"?`)) {
                      onDeleteProject(project);
                    }
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + Add New Project
        </button>
      ) : (
        <form onSubmit={handleAddProject} className="flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(false);
              setNewProjectName('');
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default ProjectSelector;

