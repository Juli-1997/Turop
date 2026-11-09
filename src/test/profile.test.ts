import { describe, expect, it } from "vitest";
import { COUNTRIES, profileSchema } from "@/lib/profile";
const profile = { name: "Juliana Pérez", country: "CO", phone: "+573001234567", bank_account: "12345678901" };
describe("Turop profile rules", () => {
  it("uses +57 for Colombia", () => { expect(COUNTRIES.find(c => c.code === "CO")?.dial).toBe("+57"); });
  it("requires name", () => { expect(profileSchema.safeParse({ ...profile, name: "" }).success).toBe(false); });
  it("requires a country and matching calling code", () => { expect(profileSchema.safeParse({ ...profile, country: "MX" }).success).toBe(false); });
  it("requires a mobile number with calling code", () => { expect(profileSchema.safeParse({ ...profile, phone: "3001234567" }).success).toBe(false); });
  it("accepts a banking account independent from mobile", () => { expect(profileSchema.parse(profile).bank_account).toBe("12345678901"); expect(profileSchema.safeParse({ ...profile, bank_account: "" }).success).toBe(false); });
});