import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPermissions, fetchRoles, updateRolePermissions } from "@/api/role.api";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

export function RolesPage() {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [pendingByRole, setPendingByRole] = useState<Record<string, string[]>>({});

  const rolesQuery = useQuery({ queryKey: ["roles"], queryFn: fetchRoles });
  const permissionsQuery = useQuery({ queryKey: ["permissions"], queryFn: fetchPermissions });

  const saveMutation = useMutation({
    mutationFn: ({ name, permissions }: { name: string; permissions: string[] }) =>
      updateRolePermissions(name, permissions),
    onSuccess: (_, { name }) => {
      showToast(`Role "${name}" updated`);
      setPendingByRole((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err) => showToast(getApiErrorMessage(err, "Failed to update role"), "error"),
  });

  if (rolesQuery.isLoading || permissionsQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-8" />
      </div>
    );
  }

  if (rolesQuery.isError || permissionsQuery.isError || !rolesQuery.data || !permissionsQuery.data) {
    return <p className="text-sm text-red-600">Failed to load roles and permissions.</p>;
  }

  const permissions = permissionsQuery.data;

  function getSelected(roleName: string, currentPermissions: string[]) {
    return pendingByRole[roleName] ?? currentPermissions;
  }

  function togglePermission(roleName: string, currentPermissions: string[], key: string) {
    const selected = getSelected(roleName, currentPermissions);
    const next = selected.includes(key)
      ? selected.filter((p) => p !== key)
      : [...selected, key];
    setPendingByRole((prev) => ({ ...prev, [roleName]: next }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Roles &amp; Permissions</h1>
        <p className="text-sm text-stone-500">
          Control what each role can do — changes apply immediately, no redeploy needed.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {rolesQuery.data.map((role) => {
          const selected = getSelected(role.name, role.permissions);
          const isDirty =
            role.name in pendingByRole &&
            JSON.stringify([...pendingByRole[role.name]].sort()) !==
              JSON.stringify([...role.permissions].sort());

          return (
            <Card key={role._id} className="border-t-2 border-t-brand-500">
              <CardHeader className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold capitalize text-stone-900">
                  {role.name}
                </h2>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {permissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-start gap-2 text-sm text-stone-700"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-brand-600"
                      checked={selected.includes(permission.key)}
                      onChange={() => togglePermission(role.name, role.permissions, permission.key)}
                    />
                    <span>
                      <span className="block font-mono text-xs font-medium text-stone-900">
                        {permission.key}
                      </span>
                      <span className="block text-xs text-stone-500">{permission.description}</span>
                    </span>
                  </label>
                ))}

                <Button
                  className="mt-2"
                  disabled={!isDirty}
                  isLoading={saveMutation.isPending}
                  onClick={() => saveMutation.mutate({ name: role.name, permissions: selected })}
                >
                  Save changes
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
