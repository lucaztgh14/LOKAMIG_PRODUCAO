// Configuração Supabase
const SUPABASE_URL = 'https://rpsdrhaptipvujixoxa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GfjR_Qn3le_MGf_33iBy0A_I58MFly-';

// Inicializa o cliente Supabase
const supabase = window.supabase?.createClient ?
    window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) :
    null;

// Funções de banco de dados
const DB_API = {
    // Salvar dados no Supabase
    salvar: async (tabela, dados) => {
        if (!supabase) return false;
        const { error } = await supabase.from(tabela).upsert(dados);
        if (error) console.error('Erro ao salvar:', error);
        return !error;
    },

    // Buscar dados do Supabase
    buscar: async (tabela, filtro = {}) => {
        if (!supabase) return [];
        let query = supabase.from(tabela).select('*');
        if (filtro.placa) query = query.eq('placa', filtro.placa);
        if (filtro.data) query = query.eq('data', filtro.data);
        const { data, error } = await query;
        if (error) console.error('Erro ao buscar:', error);
        return data || [];
    },

    // Deletar registro
    deletar: async (tabela, id) => {
        if (!supabase) return false;
        const { error } = await supabase.from(tabela).delete().eq('id', id);
        return !error;
    }
};

// Modo offline: salva no localStorage como backup
const salvarLocalmente = (chave, dados) => {
    localStorage.setItem(chave, JSON.stringify(dados));
};

console.log('✅ Supabase configurado!');
console.log('📡 URL:', SUPABASE_URL);