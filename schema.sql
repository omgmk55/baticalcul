-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PROFILES TABLE (Linked to Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT,
    email TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
-- ... (Projects, Quotes, Plannings tables remain unchanged)
-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.on_auth_user_created() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
INSERT INTO public.profiles (id, username, email, updated_at)
VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.email,
        NOW()
    );
RETURN NEW;
END;
$$;
RETURN NEW;
END;
$$;
-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_created();