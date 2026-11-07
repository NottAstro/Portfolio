-- Locks every write to the site's data to the single admin account.
-- Run once in Supabase Dashboard -> SQL Editor. Safe to re-run.
--
-- Before this, any signed-in account counted as admin, and visitors could edit
-- comments directly. After it:
--   * visitors can read public content, post comments (unpinned, no likes or
--     replies), like through increment_comment_likes, and upload comment images
--   * only the admin can create, edit or delete projects, tech stack,
--     certificates and comments, read messages, and upload site images

-- ========================================
-- WHO IS THE ADMIN
-- ========================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT auth.uid() = '77e2b730-e4c7-4784-9baa-de7e2d97993d'::uuid
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ========================================
-- RESET TABLE POLICIES
-- ========================================
-- Drops every existing policy on these tables (whatever their names) so only
-- the rules below apply.

DO $$
DECLARE p record;
BEGIN
    FOR p IN
        SELECT policyname, tablename FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('projects', 'tech_stack', 'certificates', 'comments', 'messages')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
    END LOOP;
END $$;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Projects, tech stack, certificates: public read, admin write
CREATE POLICY "Public read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Public read" ON public.tech_stack FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON public.tech_stack FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON public.tech_stack FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete" ON public.tech_stack FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY "Public read" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admin insert" ON public.certificates FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update" ON public.certificates FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete" ON public.certificates FOR DELETE TO authenticated USING (public.is_admin());

-- Comments: anyone reads and posts a plain new comment; only the admin edits,
-- pins, replies or deletes. Likes go through increment_comment_likes.
CREATE POLICY "Public read" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public post plain comment" ON public.comments FOR INSERT
    WITH CHECK (
        COALESCE(is_pinned, false) = false
        AND COALESCE(liked_by_admin, false) = false
        AND COALESCE(likes, 0) = 0
        AND COALESCE(replies, '[]'::jsonb) = '[]'::jsonb
    );
CREATE POLICY "Admin update" ON public.comments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete" ON public.comments FOR DELETE TO authenticated USING (public.is_admin());

-- Messages: written only by the server (service role); admin reads and manages
CREATE POLICY "Admin read" ON public.messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin update" ON public.messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());

-- ========================================
-- STORAGE
-- ========================================

DO $$
DECLARE p record;
BEGIN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
    LOOP
        EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
    END LOOP;
END $$;

-- Files in these public buckets are readable by anyone
CREATE POLICY "Public read site images" ON storage.objects FOR SELECT
    USING (bucket_id IN ('projects', 'tech-stack', 'certificates', 'comments'));

-- Visitors may only add comment images (no overwriting or deleting)
CREATE POLICY "Public upload comment images" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'comments');

-- Everything else is admin only
CREATE POLICY "Admin upload" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id IN ('projects', 'tech-stack', 'certificates') AND public.is_admin());
CREATE POLICY "Admin update" ON storage.objects FOR UPDATE TO authenticated
    USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete" ON storage.objects FOR DELETE TO authenticated
    USING (public.is_admin());

-- Upload size and type limits
UPDATE storage.buckets SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
WHERE id IN ('projects', 'certificates');

UPDATE storage.buckets SET file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
WHERE id = 'tech-stack';

UPDATE storage.buckets SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
WHERE id = 'comments';
