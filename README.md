# Save My Settings

A React application for managing integration settings across multiple projects. Each project can have its own key-value pair settings, making it easy to store configuration values like shipment wait times, API endpoints, and other integration parameters.

## Features

- **User Authentication**: Secure email/password authentication with Supabase Auth
- **Multi-User Support**: Each user has their own isolated projects and settings
- **Project Management**: Create, select, and delete projects
- **Settings Management**: Add, edit, and delete key-value pair settings per project
- **Supabase Integration**: All settings are persisted in Supabase database with Row Level Security
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
   - **Note**: If you have an existing database, use `supabase/migration_add_user_auth.sql` instead to migrate your data
4. Go to **Settings** → **API** to get your project credentials:
   - **Project URL** (something like `https://xxxxx.supabase.co`)
   - **anon/public key** (your anon key)
5. Configure Email Authentication:
   - Go to **Authentication** → **Providers** in your Supabase dashboard
   - Make sure **Email** provider is enabled
   - **For Development**: To disable email confirmation (recommended for testing):
     - Go to **Authentication** → **Settings** → **Auth**
     - Under "Email Auth", toggle off **"Enable email confirmations"**
     - This allows users to sign in immediately after signup without email verification
   - **For Production**: Keep email confirmations enabled for security
   - Configure email templates if needed (optional)

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

1. **Sign Up / Sign In**: 
   - First-time users: Click "Don't have an account? Sign up" to create a new account
   - Enter your email and password (minimum 6 characters)
   - After signup, you may need to verify your email (check your inbox)
   - Existing users: Enter your email and password to sign in
2. **Create a Project**: Click "Add New Project" and enter a project name
3. **Select a Project**: Click on any project name to view its settings
4. **Add Settings**: Enter a key and value in the form and click "Add Setting"
5. **Edit Settings**: Click the "Edit" button next to any setting
6. **Delete Settings**: Click the "Delete" button next to any setting
7. **Logout**: Click the "Logout" button in the top right corner

## Example

For a shipment integration, you might add:
- Key: `shipment_wait_days`
- Value: `7`

## Database Schema

The application uses two main tables:

- **projects**: Stores project names with user ownership
- **settings**: Stores key-value pairs linked to projects with user ownership

Both tables include `user_id` columns that reference `auth.users` to ensure data isolation between users.

See `supabase/schema.sql` for the complete schema definition.

## Security

The application implements Row Level Security (RLS) policies that ensure:

- Users can only view, create, update, and delete their own projects and settings
- Data is automatically filtered by the authenticated user's ID
- All database operations require authentication
- Foreign key constraints ensure data integrity

The RLS policies use `auth.uid()` to automatically filter data based on the currently authenticated user.

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
