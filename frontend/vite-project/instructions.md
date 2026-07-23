# Project Instructions

## Stack
- React 18 + TypeScript + Vite
- Routing: React Router v6
- Server state: TanStack Query v5
- Global state: Zustand
- Validation: Zod
- HTTP: Axios
- Styling: Tailwind CSS
- UI Library: shadcn/ui

---

## Architecture: Standard Layered

```
src/
├── components/     # UI components (UI primitives & complex components)
├── pages/          # Route components
├── services/       # API logic
├── models/         # Zod schemas & types
├── hooks/          # TanStack Query & custom hooks
├── store/          # Zustand global state
└── utils/          # Helper functions
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
- One file per backend resource (users, tasks, auth, etc.).
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

### Components
- **UI Components:** Reusable primitives (Buttons, Inputs). Usually from shadcn/ui.
- **Feature Components:** Components that call hooks and contain business logic (e.g., `TodoList`, `UserForm`).
- Keep components focused. Pass props for customization.

```tsx
// components/UserList.tsx
import { useUsers } from '@hooks/useUsers'
import { Card } from '@/components/ui/card'

export function UserList() {
  const { data: users, isLoading, isError } = useUsers()

  if (isLoading) return <p>Loading...</p>
  if (isError)   return <p>Something went wrong.</p>

  return (
    <div className="grid gap-4">
      {users?.map((u) => (
        <Card key={u.id} className="p-4">
          <p>{u.name} ({u.email})</p>
        </Card>
      ))}
    </div>
  )
}
```

---

### Pages
- Route-level components.
- Responsible for layout composition and route-specific logic.

```tsx
// pages/UsersPage.tsx
import { UserList } from '@components/UserList'

export function UsersPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
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
| `@components`| `src/components`|
| `@pages`    | `src/pages`    |
| `@services` | `src/services` |
| `@models`   | `src/models`   |
| `@hooks`    | `src/hooks`    |
| `@store`    | `src/store`    |
| `@utils`    | `src/utils`    |
| `@/`        | `src/`         | (Standard shadcn alias)

---

## When Adding a New Feature (checklist)

1. **Model** — define the Zod schema + infer types
2. **Service** — add the API calls for that resource
3. **Hook** — wrap the service with `useQuery` / `useMutation`
4. **Component** — build the UI and connect to the hook
5. **Page** — add the component to a page route

---

## What Goes Where (quick ref)

| Question                        | Answer              |
|---------------------------------|---------------------|
| API call                        | `services/`         |
| TypeScript type for API data    | `models/`           |
| Form validation schema          | `models/`           |
| `useQuery` / `useMutation`      | `hooks/`            |
| Auth token, current user        | `store/`            |
| UI Primitives (shadcn)          | `components/ui/`    |
| Feature-specific components     | `components/`       |
| Page / Route component          | `pages/`            |
| Date formatting, helpers        | `utils/`            |
