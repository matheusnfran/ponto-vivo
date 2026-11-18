'use strict';
const cfg = window.PONTO_VIVO_CONFIG || {};
const ready = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes('SEU-PROJETO');
const db = ready && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY) : null;
const $ = id => document.getElementById(id);
let rows = [], isAdmin = false;
const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = iso => new Date(iso).toLocaleDateString('pt-BR');
function render(){
  $('total').textContent=rows.length;
  $('pending').textContent=rows.filter(r=>r.status==='Pendente').length;
  $('progress').textContent=rows.filter(r=>r.status==='Em análise').length;
  $('resolved').textContent=rows.filter(r=>r.status==='Resolvido').length;
  const filtered = rows.filter(r=>!$('filter').value||r.status===$('filter').value);
  $('list').innerHTML=filtered.length?filtered.map(r=>`<article class="issue"><div><span class="tag">${escapeHTML(r.categoria)}</span><h3>${escapeHTML(r.titulo)}</h3><p>⌖ ${escapeHTML(r.localizacao)}</p><p>${escapeHTML(r.descricao)}</p><time datetime="${escapeHTML(r.criado_em)}">Registrado em ${date(r.criado_em)}</time></div><div class="issue-actions"><span class="status" data-status="${escapeHTML(r.status)}">● ${escapeHTML(r.status)}</span>${isAdmin?`<label for="status-${r.id}">Atualizar status</label><select id="status-${r.id}" data-id="${r.id}" aria-label="Atualizar status de ${escapeHTML(r.titulo)}">${['Pendente','Em análise','Resolvido'].map(st=>`<option ${st===r.status?'selected':''}>${st}</option>`).join('')}</select>`:'<span class="hint">Somente leitura</span>'}</div></article>`).join(''):'<div class="empty">Nenhuma ocorrência encontrada para este filtro.</div>';
  document.querySelectorAll('[data-id]').forEach(select=>select.addEventListener('change',()=>update(select.dataset.id,select.value,select)));
}
async function load(silent=false){
  if(!db){$('sync').textContent='Configure web/config.js com as credenciais públicas do Supabase.';return;}
  if(!silent)$('sync').textContent='Atualizando...';
  try{const {data,error}=await db.from('ocorrencias').select('*').order('criado_em',{ascending:false}).limit(100);if(error)throw error;rows=data||[];render();$('sync').textContent='Dados sincronizados · '+new Date().toLocaleTimeString('pt-BR');}
  catch(e){$('sync').textContent='Erro ao carregar. Verifique a configuração e a conexão.';}
}
async function checkAdmin(){
  if(!db)return;
  const {data:{user}}=await db.auth.getUser();
  isAdmin=false;
  if(user){const {data,error}=await db.from('administradores').select('usuario_id').eq('usuario_id',user.id).maybeSingle();isAdmin=!error&&!!data;}
  $('login-panel').hidden=isAdmin;
  $('logout').hidden=!user;
  $('who').textContent=isAdmin?'Gestão autenticada':user?'Conta sem acesso administrativo':'Visualização pública';
  render();
}
async function update(id,status,select){
  select.disabled=true;
  try{const {error}=await db.from('ocorrencias').update({status}).eq('id',id);if(error)throw error;$('sync').textContent='Status atualizado! O aplicativo receberá a mudança.';await load(true);}
  catch(e){$('sync').textContent='Permissão negada ou erro ao atualizar.';await load(true);}
  finally{select.disabled=false;}
}
$('login-form').addEventListener('submit',async e=>{
  e.preventDefault();$('login-error').textContent='';
  if(!db){$('login-error').textContent='Configure web/config.js antes de entrar.';return;}
  $('login-btn').disabled=true;
  try{const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error)throw error;await checkAdmin();if(!isAdmin)$('login-error').textContent='Conta autenticada, mas não autorizada como administradora.';}
  catch(e){$('login-error').textContent='Não foi possível entrar. Confira e-mail, senha e configuração.';}
  finally{$('login-btn').disabled=false;}
});
$('logout').addEventListener('click',async()=>{if(db)await db.auth.signOut();await checkAdmin();});
$('refresh').addEventListener('click',()=>load());
$('filter').addEventListener('change',render);
checkAdmin().then(()=>load());
setInterval(()=>load(true),12000);
