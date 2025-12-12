# Frontend auth shell (Next.js)

Authenticated dashboard experience built with Next.js App Router + TypeScript + Tailwind CSS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Configure FastAPI base URL

The frontend calls the backend directly from the browser using `fetch`.

1. Copy the example env file:

```bash
cp .env.example .env.local
```

2. Set the FastAPI base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Routes

Public:
- `/login`
- `/register`

Authenticated:
- `/dashboard`
- `/members` (directory list)
- `/members/[memberId]` (member detail)
- `/attendance` (check-in / check-out)
- `/management` (staff/pastor only)

## Roles and permissions

The UI enables extra management actions for `pastor` and `staff` roles:
- Management navigation module
- Member list “Add member” placeholder action
- Member detail “Set role” action (PATCH `/members/:id`)
- Attendance page can log check-in/out for any member

`member` and `guest` roles see read-only directory views and can only log their own attendance.

## Responsive layout

- Mobile-first layout with a compact top navigation.
- At `sm` (≥ 640px), navigation switches to a full inline nav with user details.
- Directory pages use responsive grids (`sm:grid-cols-2`, `lg:grid-cols-3`).
