create table if not exists public.ocorrencias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 5 and 100),
  descricao text not null check (char_length(descricao) between 10 and 500),
  localizacao text not null check (char_length(localizacao) between 5 and 140),
  categoria text not null check (categoria in ('Iluminação','Estrutura','Acessibilidade','Segurança','Outros')),
  status text not null default 'Pendente' check (status in ('Pendente','Em análise','Resolvido')),
  criado_em timestamptz not null default now()
);

-- Lista privada de contas com permissão de gestão.
create table if not exists public.administradores (
  usuario_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.ocorrencias enable row level security;
alter table public.administradores enable row level security;

-- Qualquer visitante pode acompanhar e enviar relatos; não pode modificar/apagar relatos.
create policy "Leitura pública de ocorrências" on public.ocorrencias
for select to anon, authenticated using (true);

create policy "Envio público de ocorrências" on public.ocorrencias
for insert to anon, authenticated with check (status = 'Pendente');

-- Uma pessoa autenticada pode consultar apenas sua própria associação administrativa.
create policy "Consultar próprio acesso administrativo" on public.administradores
for select to authenticated using (usuario_id = (select auth.uid()));

create policy "Admin pode atualizar ocorrências" on public.ocorrencias
for update to authenticated
using (exists(select 1 from public.administradores where usuario_id = (select auth.uid())))
with check (exists(select 1 from public.administradores where usuario_id = (select auth.uid())));