import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { profileSchema, type ProfileInput } from "@/lib/profile";

export const getProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader("Cache-Control", "no-store");
  const { data, error } = await context.supabase.from("profiles").select("name,country,phone,bank_account").eq("id", context.userId).single();
  if (error) throw new Error("No se pudo cargar el perfil.");
  const { data: user } = await context.supabase.auth.getUser();
  return { ...data, email: user.user?.email ?? "" };
});
export const updateProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: ProfileInput) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const result = await context.supabase.from("profiles").update(data).eq("id", context.userId).select("name,country,phone,bank_account").single();
    if (result.error) throw new Error("No se pudo guardar el perfil.");
    return result.data;
  });