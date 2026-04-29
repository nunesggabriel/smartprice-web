import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Produto, ResultadoSimulacao } from '../../types/types';

const Simulacao = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [simulando, setSimulando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  const [form, setForm] = useState({
    produto_id: '',
    markup: '',
  });

  const buscarProdutos = async () => {
    try {
      const { data } = await api.get<Produto[]>('/produtos');
      setProdutos(data);
    } catch {
      setErro('Erro ao buscar produtos.');
    } finally {
      setCarregando(false);
    }
  };

  const buscarConfiguracao = async () => {
    try {
      const { data } = await api.get('/configuracaoprecificacao');
      if (data.length > 0) {
        setForm((prev) => ({ ...prev, markup: data[0].lucro_percentual.toString() }));
      }
    } catch {
      // se não tiver configuração, deixa em branco
    }
  };

  useEffect(() => {
    buscarProdutos();
    buscarConfiguracao();
  }, []);

  const handleSimular = async () => {
    setErro('');
    setResultado(null);

    if (!form.produto_id) {
      setErro('Selecione um produto.');
      return;
    }

    if (!form.markup || Number(form.markup) <= 0) {
      setErro('Informe o markup.');
      return;
    }

    setSimulando(true);
    try {
      const { data } = await api.post<ResultadoSimulacao>(
        `/simulacao/${form.produto_id}`,
        { markup: Number(form.markup) }
      );
      setResultado(data);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setErro(error.response.data.message);
      } else {
        setErro('Erro ao realizar simulação.');
      }
    } finally {
      setSimulando(false);
    }
  };

  const handleLimpar = () => {
    setResultado(null);
    setErro('');
    setForm((prev) => ({ ...prev, produto_id: '' }));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Simulação de preço</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Calcule o preço de venda ideal com base nos custos reais do produto
        </p>
      </div>

      {carregando ? (
        <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl">

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">Parâmetros da simulação</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                <select
                  value={form.produto_id}
                  onChange={(e) => setForm({ ...form, produto_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.referencia}{p.descricao ? ` — ${p.descricao}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Markup *</label>
                <input
                  type="number"
                  value={form.markup}
                  onChange={(e) => setForm({ ...form, markup: e.target.value })}
                  placeholder="Ex: 2.5"
                  step="0.1"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Valor pré-definido conforme configuração. Pode ser alterado para esta simulação.
                </p>
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {erro}
                </div>
              )}

              <div className="flex gap-3">
                {resultado && (
                  <button
                    onClick={handleLimpar}
                    className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={handleSimular}
                  disabled={simulando}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
                >
                  {simulando ? 'Calculando...' : 'Calcular preço'}
                </button>
              </div>
            </div>
          </div>

          {resultado && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

              <div className="bg-blue-600 px-6 py-4">
                <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">
                  Resultado da simulação
                </p>
                <p className="text-white text-lg font-bold mt-0.5">
                  {resultado.produto.referencia}
                  {resultado.produto.descricao ? ` — ${resultado.produto.descricao}` : ''}
                </p>
              </div>

              <div className="px-6 py-4 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Composição do custo
                </p>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Matéria prima</span>
                  <span className="text-sm font-medium text-gray-800">
                    R$ {resultado.detalhamento.custo_materia_prima}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Rateio de despesas</span>
                  <span className="text-sm font-medium text-gray-800">
                    R$ {resultado.detalhamento.custo_rateado_despesas}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Custo base</span>
                  <span className="text-sm font-medium text-gray-800">
                    R$ {resultado.detalhamento.custo_base}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">
                    Impostos ({resultado.detalhamento.percentual_impostos})
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    R$ {resultado.detalhamento.custo_com_imposto}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Markup aplicado</span>
                  <span className="text-sm font-medium text-gray-800">
                    × {resultado.detalhamento.markup_aplicado}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 bg-green-50 border-t border-green-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Preço de venda sugerido</p>
                  <p className="text-xs text-green-500 mt-0.5">
                    Produção mensal: {resultado.produto.producao_mensal} un/mês
                  </p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  R$ {resultado.preco_venda_sugerido}
                </p>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Simulacao;