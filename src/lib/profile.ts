import { z } from "zod";

export const COUNTRIES = [
  { code: "CO", name: "Colombia", dial: "+57" }, { code: "MX", name: "México", dial: "+52" },
  { code: "AR", name: "Argentina", dial: "+54" }, { code: "CL", name: "Chile", dial: "+56" },
  { code: "PE", name: "Perú", dial: "+51" }, { code: "EC", name: "Ecuador", dial: "+593" },
  { code: "VE", name: "Venezuela", dial: "+58" }, { code: "US", name: "Estados Unidos", dial: "+1" },
  { code: "ES", name: "España", dial: "+34" }, { code: "BR", name: "Brasil", dial: "+55" },
  { code: "UY", name: "Uruguay", dial: "+598" }, { code: "PA", name: "Panamá", dial: "+507" },
  { code: "CR", name: "Costa Rica", dial: "+506" }, { code: "DO", name: "República Dominicana", dial: "+1" },
  { code: "BO", name: "Bolivia", dial: "+591" }, { code: "PY", name: "Paraguay", dial: "+595" },
  { code: "GT", name: "Guatemala", dial: "+502" }, { code: "HN", name: "Honduras", dial: "+504" },
  { code: "SV", name: "El Salvador", dial: "+503" }, { code: "NI", name: "Nicaragua", dial: "+505" },
];
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo.").max(100),
  country: z.string().refine(c => COUNTRIES.some(x => x.code === c), "Selecciona un país."),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/, "Revisa el indicativo y el número de celular."),
  bank_account: z.string().regex(/^\d{4,34}$/, "Escribe entre 4 y 34 dígitos para la cuenta bancaria."),
}).superRefine((p, ctx) => {
  const country = COUNTRIES.find(c => c.code === p.country);
  if (country && !p.phone.startsWith(country.dial)) ctx.addIssue({ code: "custom", path: ["phone"], message: "El indicativo debe coincidir con el país." });
});
export type ProfileInput = z.infer<typeof profileSchema>;
export const emailSchema = z.string().trim().email("Escribe un correo válido.").max(255);
export const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(128);