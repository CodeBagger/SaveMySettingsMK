# Save My Settings

A React application for managing integration settings across multiple projects. Each project can have its own key-value pair settings, making it easy to store configuration values like shipment wait times, API endpoints, and other integration parameters.

## Features

- **Project Management**: Create, select, and delete projects
- **Settings Management**: Add, edit, and delete key-value pair settings per project
- **Supabase Integration**: All settings are persisted in Supabase database
- **Modern UI**: Clean, responsive interface built with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free tier works fine)

## Getting Started

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the SQL script from `supabase/schema.sql` to create the necessary tables and policies
4. Go to **Settings** → **API** to get your project credentials:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon/public key** (your anon key)

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Open Your Browser

Navigate to `http://localhost:5173`

## Usage

1. **Create a Project**: Click "Add New Project" and enter a project name
2. **Select a Project**: Click on any project name to view its settings
3. **Add Settings**: Enter a key and value in the form and click "Add Setting"
4. **Edit Settings**: Click the "Edit" button next to any setting
5. **Delete Settings**: Click the "Delete" button next to any setting

## Example

For a shipment integration, you might add:
- Key: `shipment_wait_days`
- Value: `7`

## Database Schema

The application uses two main tables:

- **projects**: Stores project names
- **settings**: Stores key-value pairs linked to projects

See `supabase/schema.sql` for the complete schema definition.

## Security Notes

The provided SQL schema includes public read/write access policies for simplicity. In a production environment, you should:

1. Implement proper authentication (Supabase Auth)
2. Update Row Level Security (RLS) policies to restrict access based on user authentication
3. Consider using service role keys for server-side operations only

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your GitHub repository
4. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
5. Click "Deploy"

Vercel will automatically detect this as a Vite project and configure the build settings.

**Important:** Make sure to add your environment variables in Vercel's project settings (Settings → Environment Variables) for the production environment.

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Supabase (PostgreSQL)
