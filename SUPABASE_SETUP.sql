-- O.G.A.I.T. / LOKAMIG — políticas recomendadas (execute no SQL Editor do Supabase)
-- Ajuste conforme sua política de segurança. Anon key do app precisa ler colaboradores/forn_users para login.

-- ═══ REALTIME (habilitar tabela prog) ═══
-- Dashboard → Database → Publications → supabase_realtime → incluir public.prog

-- ═══ STORAGE (fallback fotos) ═══
-- Crie bucket público: evidencias-prog
-- insert policy para anon/authenticated conforme seu modelo

-- ═══ RLS: leitura para login (exemplo permissivo — REVISE!) ═══
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE forn_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_colaboradores_login" ON colaboradores;
CREATE POLICY "anon_read_colaboradores_login" ON colaboradores
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_read_forn_users_login" ON forn_users;
CREATE POLICY "anon_read_forn_users_login" ON forn_users
  FOR SELECT TO anon, authenticated USING (true);

-- ═══ RLS: prog (fornecedor/programador/admin) ═══
ALTER TABLE prog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_prog" ON prog;
CREATE POLICY "anon_all_prog" ON prog
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ═══ Coluna fotos JSONB (recomendado) ═══
-- ALTER TABLE prog ALTER COLUMN fotos TYPE jsonb USING fotos::jsonb;
