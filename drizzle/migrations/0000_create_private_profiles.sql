CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 name text NOT NULL DEFAULT '' CHECK (char_length(name) <= 100),
 country text NOT NULL DEFAULT 'CO' CHECK (country IN ('CO','MX','AR','CL','PE','EC','VE','US','ES','BR','UY','PA','CR','DO','BO','PY','GT','HN','SV','NI')),
 phone text NOT NULL DEFAULT '' CHECK (phone = '' OR phone ~ '^\+[1-9][0-9]{7,14}$'),
 bank_account text NOT NULL DEFAULT '' CHECK (bank_account = '' OR bank_account ~ '^[0-9]{4,34}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
CREATE FUNCTION public.create_signup_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, name) VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),100));
 RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_signup_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER create_signup_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_signup_profile();