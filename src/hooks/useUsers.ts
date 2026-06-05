import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsersFromDb, updateUserProfileInDb, createUserWithRole } from '@/services/auth';
import { logActivity } from '@/services/activity';
import type { AppUser, UserRole } from '@/types';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersFromDb,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<AppUser> }) =>
      updateUserProfileInDb(uid, data),
    onSuccess: async (_, { uid, data }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      await logActivity(
        'updated',
        'user',
        uid,
        data.displayName || 'Unknown',
        `Updated user: ${data.displayName} - Role: ${data.role}`,
        'info'
      );
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      password,
      displayName,
      role,
    }: {
      email: string;
      password: string;
      displayName: string;
      role: UserRole;
    }) => createUserWithRole(email, password, displayName, role),
    onSuccess: async (_, { email, displayName, role }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      await logActivity(
        'created',
        'user',
        _.user.uid,
        displayName,
        `Created user: ${displayName} (${email}) with role: ${role}`,
        'info'
      );
    },
  });
}