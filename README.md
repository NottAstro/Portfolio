# Aaryan Jain — Portfolio

Personal portfolio website of **Aaryan Jain**, Software Engineer & Full-Stack Developer.

Built with Next.js 16 (App Router), React 19, Supabase, three.js and Framer Motion.

## Features

- Animated intro and hero with an interactive 3D ID card on a physics lanyard (desktop)
- Projects, certificates and tech stack loaded live from Supabase
- GitHub contributions heatmap with yearly stats
- Contact form and a realtime comments wall (with image uploads and likes)
- Protected admin panel to manage projects, certificates, tech stack and comments

## Tech Stack

| Area      | Tools                                                     |
| --------- | --------------------------------------------------------- |
| Framework | Next.js 16, React 19, TypeScript                          |
| Styling   | Tailwind CSS, Framer Motion                               |
| 3D        | three.js, @react-three/fiber, drei, rapier, meshline      |
| Backend   | Supabase (Postgres, Auth, Storage, Realtime)              |

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

The Supabase schema, row-level security policies and migrations live in [`supabase/`](supabase).
Run `supabase/schema.sql` in the Supabase SQL Editor to create the tables.

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Create a production build    |
| `npm start`         | Serve the production build   |
| `npm run lint`      | Run ESLint                   |
| `npm run typecheck` | Type-check with TypeScript   |

## Author

**Aaryan Jain** — [GitHub @NottAstro](https://github.com/NottAstro) · [LinkedIn](https://www.linkedin.com/in/jainaaryan0410)
