# Project Instructions

## Stack
- React 18 + TypeScript + Vite
- Routing: React Router v6
- Server state: TanStack Query v5
- Global state: Zustand
- Validation: Zod
- HTTP: Axios
- Styling: Tailwind CSS

---

## Architecture: Atomic Design

Every piece of UI or logic belongs in exactly one layer. Do not skip layers.

```
src/
├── atomic-design/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── pages/
├── services/
├── models/
├── hooks/
├── store/
└── utils/
```

---

## Rules

### Models
- Define schema with Zod first, then infer the TypeScript type from it.
- Never write a `type` or `interface` for API data manually — derive it from the schema.
- DTOs (Create/Update) are separate schemas, not the full model.

```ts
// models/user.model.ts
import { z } from 'zod'

export const UserSchema = z.object({
  id:    z.string().uuid(),
  email: z.string().email(),
  name:  z.string().min(1),
  role:  z.enum(['admin', 'viewer']),
})

export type User = z.infer<typeof UserSchema>

export const CreateUserSchema = UserSchema.omit({ id: true })
export type CreateUserDto = z.infer<typeof CreateUserSchema>
```

---

### Services
- One file per backend resource (users, posts, auth, etc.).
- Import types from models. Return typed data only.
- No React, no hooks, no state inside services.

```ts
// services/user.service.ts
import { http } from './http.client'
import type { User, CreateUserDto } from '@models/user.model'

export const userService = {
  getAll:   async (): Promise<User[]>              => (await http.get('/users')).data,
  getById:  async (id: string): Promise<User>      => (await http.get(`/users/${id}`)).data,
  create:   async (dto: CreateUserDto): Promise<User> => (await http.post('/users', dto)).data,
  update:   async (id: string, dto: Partial<CreateUserDto>): Promise<User> =>
                (await http.patch(`/users/${id}`, dto)).data,
  delete:   async (id: string): Promise<void>      => { await http.delete(`/users/${id}`) },
}
```

---

### Hooks (TanStack Query)
- One hook file per resource.
- `useQuery` for reads, `useMutation` for writes.
- Always define a `queryKey` as a constant at the top of the file.
- Invalidate the query key after a successful mutation.

```ts
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@services/user.service'
import type { CreateUserDto } from '@models/user.model'

export const USER_KEYS = {
  all:    ['users']           as const,
  detail: (id: string) => ['users', id] as const,
}

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.all,
    queryFn:  userService.getAll,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateUserDto) => userService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_KEYS.all }),
  })
}
```

---

### Store (Zustand)
- Only for global UI state: auth session, theme, sidebar open/close, notifications.
- Do NOT put server data in Zustand — that belongs in TanStack Query.
- One store per concern.

```ts
// store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  accessToken:  string | null
  user:         { id: string; email: string } | null
  isAuthenticated: boolean
  setTokens: (access: string) => void
  logout:    () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken:     null,
      user:            null,
      isAuthenticated: false,
      setTokens: (access) => set({ accessToken: access, isAuthenticated: true }),
      logout:    ()       => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'auth' }
  )
)
```

---

### Atoms
- Accept only props. No hooks (except useState for local toggle/input state).
- Must be fully reusable with no business logic.

```tsx
// atoms/Button/Button.tsx
type ButtonProps = {
  label:    string
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  loading?:  boolean
}

export function Button({ label, onClick, variant = 'primary', disabled, loading }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`btn btn-${variant}`}>
      {loading ? 'Loading...' : label}
    </button>
  )
}
```

---

### Organisms
- This is where hooks are called and business logic lives.
- Compose molecules and atoms. Pass data down as props.

```tsx
// organisms/UserList/UserList.tsx
import { useUsers } from '@hooks/useUsers'
import { UserCard } from '@molecules/UserCard'

export function UserList() {
  const { data: users, isLoading, isError } = useUsers()

  if (isLoading) return <p>Loading...</p>
  if (isError)   return <p>Something went wrong.</p>

  return (
    <ul>
      {users?.map((u) => <UserCard key={u.id} user={u} />)}
    </ul>
  )
}
```

---

### Pages
- Import organisms only. No hooks, no direct service calls.
- Responsible for: page title, layout composition, route params.

```tsx
// pages/UsersPage.tsx
import { UserList } from '@organisms/UserList'

export function UsersPage() {
  return (
    <main>
      <h1>Users</h1>
      <UserList />
    </main>
  )
}
```

---

## Path Aliases
Always use aliases — never relative paths like `../../`.

| Alias        | Maps to        |
|-------------|----------------|
| `@atoms`    | `src/atomic-design/atoms`    |
| `@molecules`| `src/atomic-design/molecules`|
| `@organisms`| `src/atomic-design/organisms`|
| `@pages`    | `src/pages`    |
| `@services` | `src/services` |
| `@models`   | `src/models`   |
| `@hooks`    | `src/hooks`    |
| `@store`    | `src/store`    |
| `@utils`    | `src/utils`    |

---

## When Adding a New Feature (checklist)

1. **Model** — define the Zod schema + infer types
2. **Service** — add the API calls for that resource
3. **Hook** — wrap the service with `useQuery` / `useMutation`
4. **Atom/Molecule** — build any new UI primitives needed
5. **Organism** — compose UI, call the hook
6. **Page** — drop the organism in, done

---

## What Goes Where (quick ref)

| Question                        | Answer              |
|---------------------------------|---------------------|
| API call                        | `services/`         |
| TypeScript type for API data    | `models/`           |
| Form validation schema          | `models/`           |
| `useQuery` / `useMutation`      | `hooks/`            |
| Auth token, current user        | `store/`            |
| Button, Input, Badge            | `atoms/`            |
| Form field, Card, Search bar    | `molecules/`        |
| Table with data, full form      | `organisms/`        |
| Page layout / sidebar structure | `templates/`        |
| Route component                 | `pages/`            |
| Date formatting, string helpers | `utils/`            |