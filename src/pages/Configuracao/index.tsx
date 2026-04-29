import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { ConfiguracaoPrecificacao } from '../../types/types';

const Configuracao = () => {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoPrecificacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [form, setForm] = useState({ lucro_percentual: '' });

  const buscarConfiguracao = async () => {
    try {
      const { data } = await api.get<ConfiguracaoPrecificacao[]>('/configuracaoprecificacao');
      if (data.length > 0) {
        setConfiguracao(data[0]);
        setForm({ lucro_percentual: data[0].lucro_percentual.toString() });
      }
    } catch {
      setErro('Erro ao buscar configuração.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscarConfiguracao(); }, []);

  const handleSalvar = async () => {
    setErro('');
    if (!form.lucro_percentual || Number(form.lucro_percentual) <= 0) { setErro('Informe um markup válido.'); return; }

    setSalvando(true);
    try {
      const payload = { lucro_percentual: Number(form.lucro_percentual) };
      if (configuracao) {
        await api.put(`/configuracaoprecificacao/${configuracao.id}`, payload);
      } else {
        await api.post('/configuracaoprecificacao', payload);
      }
      setSucesso('Configuração salva com sucesso!');
      buscarConfiguracao();
      setTimeout(() => setSucesso(''), 3000);
    } catch {
      setErro('Erro ao salvar configuração.');
    } finally {
      setSalvando(false);
    }
  };

  const markup = Number(form.lucro_percentual) || 0;
  const exemploPrecoVenda = markup > 0 ? (100 * markup).toFixed(2) : '—';
  const exemploLucro = markup > 0 ? ((100 * markup) - 100).toFixed(2) : '—';
  const exemploPercentual = markup > 0 ? (((markup - 1)) * 100).toFixed(0) : '—';
  const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Configuração</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Defina o markup padrão para a precificação</p>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-1">Markup padrão</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              O markup é o multiplicador aplicado sobre o custo total do produto para definir o preço de venda. Um markup de 2.5 significa que o preço de venda será 2.5× o custo.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coeficiente de markup *</label>
                <input type="number" value={form.lucro_percentual} onChange={(e) => setForm({ lucro_percentual: e.target.value })} placeholder="Ex: 2.5" step="0.1" min="1" className={inputClass} />
                <p className="text-xs text-gray-400 mt-1">Valor mínimo recomendado: 1.5 — abaixo disso o produto pode ser vendido no prejuízo.</p>
              </div>
              {erro && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5">{erro}</div>}
              {sucesso && <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-2.5">{sucesso}</div>}
              <button onClick={handleSalvar} disabled={salvando} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
                {salvando ? 'Salvando...' : configuracao ? 'Salvar alterações' : 'Salvar configuração'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Exemplo com markup {markup || '?'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Custo total do produto</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">R$ 100,00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Markup aplicado</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">× {markup || '?'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Preço de venda</span>
                <span className="text-sm font-bold text-blue-600">{exemploPrecoVenda !== '—' ? `R$ ${exemploPrecoVenda}` : '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Lucro</span>
                <span className="text-sm font-bold text-green-600">{exemploLucro !== '—' ? `R$ ${exemploLucro} (${exemploPercentual}%)` : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracao;