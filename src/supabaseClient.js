// Supabase removido — backend es PostgreSQL vía n8n
// Stub para evitar errores en imports legacy que aún puedan quedar
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ error: null }),
  }),
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  removeChannel: () => {},
};
