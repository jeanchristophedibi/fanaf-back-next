ą
# Migration vers Next.js

## Installation

```bash
pnpm add next@latest react@^18 react-dom@^18
pnpm add -D @types/node @types/react @types/react-dom typescript eslint eslint-config-next
```

## Configuration

### 1. Créer `next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['clyzgrxohdduaetvbyxq.supabase.co'],
  },
}

module.exports = nextConfig
```

### 2. Créer `.env.local`
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### 3. Modifier `package.json`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 4. Créer la structure Next.js
```
src/
  app/
    page.tsx          # Page d'accueil
    layout.tsx        # Layout global
    login/
      page.tsx        # Page de login
    signin/
      page.tsx        # Page de connexion
    signup/
      page.tsx        # Page d'inscription
    dashboard/
      page.tsx        # Dashboard principal
```

### 5. Migrer les composants

Les composants existants restent inchangés. Seuls les imports de routing changent :

**Remplacement :**
- `import { Link } from 'react-router-dom'` → `import Link from 'next/link'`
- `import { useNavigate } from 'react-router-dom'` → `import { useRouter } from 'next/navigation'`
- `navigate('/path')` → `router.push('/path')`

### 6. Migrer les routes

Remplacer `AppRouter.tsx` par la structure de fichiers Next.js dans `app/`

