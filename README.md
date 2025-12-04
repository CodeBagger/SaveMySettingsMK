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

**For Local Development:**

Create a `.env` file in the root directory (this file is gitignored and won't be committed):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

**Note:** The `.env` file is gitignored for security reasons. Each developer needs to create their own `.env` file locally. The `env.example` file shows what variables are needed without exposing secrets.

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

The application uses three main tables:

- **projects**: Stores project names with user ownership
- **settings**: Stores key-value pairs linked to projects with user ownership
- **api_keys**: Stores API keys for programmatic access to settings

All tables include `user_id` columns that reference `auth.users` to ensure data isolation between users.

See `supabase/schema.sql` and `supabase/schema_api_keys.sql` for the complete schema definitions.

## Security

The application implements Row Level Security (RLS) policies that ensure:

- Users can only view, create, update, and delete their own projects and settings
- Data is automatically filtered by the authenticated user's ID
- All database operations require authentication
- Foreign key constraints ensure data integrity

The RLS policies use `auth.uid()` to automatically filter data based on the currently authenticated user.

## API Access

The application provides a REST API for programmatic access to settings using API keys.

### Setting Up API Access

1. **Run the API keys schema** in your Supabase SQL Editor:
   - Execute `supabase/schema_api_keys.sql` to create the `api_keys` table

2. **Add Supabase Service Role Key** to your Vercel environment variables:
   - Go to your Supabase dashboard → Settings → API
   - Copy the **service_role** key (⚠️ Keep this secret!)
   - Add it to Vercel as `SUPABASE_SERVICE_ROLE_KEY`

3. **Create API Keys**:
   - Log into the application
   - Navigate to the "API Keys" section at the bottom
   - Click "Create API Key"
   - Give it a name and optionally link it to a specific project
   - **Important**: Copy the API key immediately - you won't be able to see it again!

### Using the API

**Endpoint:** `GET /api/get-settings`

**Authentication:**
- Provide your API key via the `X-API-Key` header, or
- Use the `api_key` query parameter

**Query Parameters:**
- `project` (optional): Project name to get settings from. If not provided and API key is linked to a project, that project is used.
- `key` (optional): Specific setting key to retrieve. If not provided, all settings for the project are returned.

**Examples:**

Get all settings for a project:
```bash
curl -H "X-API-Key: your_api_key_here" \
  "https://your-app.vercel.app/api/get-settings?project=MyProject"
```

Get a specific setting:
```bash
curl -H "X-API-Key: your_api_key_here" \
  "https://your-app.vercel.app/api/get-settings?project=MyProject&key=shipment_wait_days"
```

Using query parameter instead of header:
```bash
curl "https://your-app.vercel.app/api/get-settings?api_key=your_api_key_here&project=MyProject"
```

**Response Format:**

All settings:
```json
{
  "project": "MyProject",
  "settings": {
    "shipment_wait_days": "7",
    "api_endpoint": "https://api.example.com"
  }
}
```

Single setting:
```json
{
  "project": "MyProject",
  "key": "shipment_wait_days",
  "value": "7"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing API key
- `404 Not Found`: Project or setting key not found
- `500 Internal Server Error`: Server error

**Security Notes:**
- API keys are scoped to the user who created them
- API keys can be linked to specific projects for additional security
- API keys can be deactivated without deletion
- Keep your API keys secure and never commit them to version control

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
4. **Add environment variables** in Vercel project settings (Settings → Environment Variables):
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for API endpoint)
   - Make sure to add these for the **Production** environment (and Preview/Development if needed)
5. Click "Deploy"

Vercel will automatically detect this as a Vite project and configure the build settings.

**How Environment Variables Work:**
- **Local Development**: Vite reads from your `.env` file (not committed to git)
- **Production (Vercel)**: Environment variables are set in Vercel's dashboard, not from a `.env` file
- Vite injects these variables at build time using `import.meta.env.VITE_*`
- The `.env` file is gitignored to prevent committing secrets to your repository

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Supabase (PostgreSQL)
