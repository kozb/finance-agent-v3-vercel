# Finance Agent v3 - Frontend

React frontend for the Finance Agent application, deployed on Vercel.

## Tech Stack

- React 18
- TypeScript
- Vite
- shadcn/ui
- Tailwind CSS
- Supabase (Backend)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## Build

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Deployment

This project is configured for deployment on Vercel.

### Vercel Configuration

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment Variables (set in Vercel)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── lib/           # Utilities and Supabase client
│   └── ...
├── public/            # Static assets
└── package.json
```

