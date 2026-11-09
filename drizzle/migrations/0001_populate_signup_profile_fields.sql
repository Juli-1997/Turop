CREATE OR REPLACE FUNCTION public.create_signup_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, name, country, phone, bank_account) VALUES (
 NEW.id,
 left(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 100),
 coalesce(NEW.raw_user_meta_data->>'country', 'CO'),
 coalesce(NEW.raw_user_meta_data->>'phone', ''),
 coalesce(NEW.raw_user_meta_data->>'bank_account', '')
 );
 RETURN NEW;
END;
$$;