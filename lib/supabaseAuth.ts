import { supabase, supabaseCall } from './supabase';

export async function generateMagicLink(email: string): Promise<string> {
  return supabaseCall(async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: process.env.NEXT_PUBLIC_APP_URL || 'https://www.cloudhire.app/' } });
    if (error) throw error;
    return (data as any).properties?.action_link || 'Link generated - check Supabase dashboard for details';
  });
}

export async function getCurrentUser() {
  return supabaseCall(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  });
}

export async function checkAdminRole(userId: string): Promise<boolean> {
  return supabaseCall(async () => {
    const { data, error } = await supabase.from('user_info').select('role').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
      console.error('Error checking admin role:', error);
      return false;
    }
    return data?.role === 'admin';
  });
}

export async function logout(): Promise<void> {
  return supabaseCall(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  });
}

export async function getTestUserId() {
  return supabaseCall(async () => {
    try {
      const { data, error } = await supabase.from('user_info').select('id').eq('role', 'admin').single();
      if (error) {
        console.log('No admin user found, creating fallback:', error);
        // Return a proper UUID format for development
        return '00000000-0000-0000-0000-000000000001';
      }
      return data?.id || '00000000-0000-0000-0000-000000000001';
    } catch (err) {
      console.error('Error fetching admin user:', err);
      return '00000000-0000-0000-0000-000000000001';
    }
  });
}

export function createTestSession() {
  return { id: 'test-user-id' };
}
