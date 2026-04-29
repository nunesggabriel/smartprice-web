import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Produto, Insumo, ProdutoInsumo } from '../../types/types';

const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalInsumoAberto, setModalInsumoAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [insumosVinculados, setInsumosVinculados] = useState<ProdutoInsumo[]>([]);

  const [form, setForm] = useState({
    referencia: '',
    descricao: '',
    custo_base: '',
    producao_mensal: '',
  });

  const [formInsumo, setFormInsumo] = useState({
    insumo_id: '',
    quantidade: '',
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

  const buscarInsumos = async () => {
    try {
      const { data } = await api.get<Insumo[]>('/insumos');
      setInsumos(data);
    } catch {
      setErro('Erro ao buscar insumos.');
    }
  };

  const buscarInsumosVinculados = async (produto_id: number) => {
    try {
      const { data } = await api.get(`/produto-insumos/produto/${produto_id}`);
      setInsumosVinculados(data.insumos ?? []);
    } catch {
      setInsumosVinculados([]);
    }
  };

  useEffect(() => {
    buscarProdutos();
    buscarInsumos();
  }, []);

  const abrirModalNovo = () => {
    setProdutoEditando(null);
    setForm({ referencia: '', descricao: '', custo_base: '', producao_mensal: '' });
    setErro('');
    setModalAberto(true);
  };

  const abrirModalEditar = (produto: Produto) => {
    setProdutoEditando(produto);
    setForm({
      referencia: produto.referencia,
      descricao: produto.descricao ?? '',
      custo_base: produto.custo_base?.toString() ?? '',
      producao_mensal: produto.producao_mensal?.toString() ?? '',
    });
    setErro('');
    setModalAberto(true);
  };

  const abrirModalInsumos = async (produto: Produto) => {
    setProdutoSelecionado(produto);
    setFormInsumo({ insumo_id: '', quantidade: '' });
    setErro('');
    await buscarInsumosVinculados(produto.id);
    setModalInsumoAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErro('');
    setProdutoEditando(null);
    setForm({ referencia: '', descricao: '', custo_base: '', producao_mensal: '' });
  };

  const fecharModalInsumo = () => {
    setModalInsumoAberto(false);
    setErro('');
    setProdutoSelecionado(null);
    setInsumosVinculados([]);
  };

  const handleSalvar = async () => {
    setErro('');
    if (!form.referencia) { setErro('A referência é obrigatória.'); return; }
    if (!form.producao_mensal || Number(form.producao_mensal) <= 0) { setErro('Informe a produção mensal.'); return; }

    try {
      const payload = {
        referencia: form.referencia,
        descricao: form.descricao,
        custo_base: form.custo_base ? Number(form.custo_base) : 0,
        producao_mensal: Number(form.producao_mensal),
      };
      if (produtoEditando) {
        await api.put(`/produtos/${produtoEditando.id}`, payload);
      } else {
        await api.post('/produtos', payload);
      }
      fecharModal();
      await buscarProdutos();
      setSucesso(produtoEditando ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErro('Já existe um produto com essa referência.');
      } else {
        setErro('Erro ao salvar produto.');
      }
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      await api.delete(`/produtos/${id}`);
      await buscarProdutos();
      setSucesso('Produto excluído com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch {
      setErro('Erro ao excluir produto.');
    }
  };

  const handleVincularInsumo = async () => {
    setErro('');
    if (!formInsumo.insumo_id) { setErro('Selecione um insumo.'); return; }
    if (!formInsumo.quantidade || Number(formInsumo.quantidade) <= 0) { setErro('Informe a quantidade.'); return; }

    try {
      await api.post('/produto-insumos', {
        produto_id: produtoSelecionado!.id,
        insumo_id: Number(formInsumo.insumo_id),
        quantidade: Number(formInsumo.quantidade),
      });
      setFormInsumo({ insumo_id: '', quantidade: '' });
      await buscarInsumosVinculados(produtoSelecionado!.id);
      setSucesso('Insumo vinculado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErro('Insumo já vinculado. Use o campo de quantidade para atualizar.');
      } else {
        setErro('Erro ao vincular insumo.');
      }
    }
  };

  const handleRemoverVinculo = async (id: number) => {
    if (!confirm('Deseja remover este insumo do produto?')) return;
    try {
      await api.delete(`/produto-insumos/${id}`);
      await buscarInsumosVinculados(produtoSelecionado!.id);
      setSucesso('Insumo removido com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch {
      setErro('Erro ao remover insumo.');
    }
  };

  const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Produtos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gerencie os produtos da sua confecção</p>
        </div>
        <button onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          + Novo produto
        </button>
      </div>

      {sucesso && <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-2.5 mb-4">{sucesso}</div>}
      {erro && !modalAberto && !modalInsumoAberto && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">{erro}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {carregando ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhum produto cadastrado. Clique em "+ Novo produto" para começar.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Referência</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Descrição</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Produção mensal</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Custo base</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto, index) => (
                <tr key={produto.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">{produto.referencia}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{produto.descricao ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{produto.producao_mensal ?? '—'} un/mês</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{produto.custo_base ? `R$ ${Number(produto.custo_base).toFixed(2)}` : '—'}</td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <button onClick={() => abrirModalInsumos(produto)} className="text-green-600 hover:underline">Insumos</button>
                    <button onClick={() => abrirModalEditar(produto)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleExcluir(produto.id)} className="text-red-500 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal produto */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{produtoEditando ? 'Editar produto' : 'Novo produto'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Referência *</label>
                <input type="text" value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} placeholder="Ex: CAM-001" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input type="text" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex: Camiseta básica manga curta" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produção mensal (unidades) *</label>
                <input type="number" value={form.producao_mensal} onChange={(e) => setForm({ ...form, producao_mensal: e.target.value })} placeholder="Ex: 100" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custo base (R$)</label>
                <input type="number" value={form.custo_base} onChange={(e) => setForm({ ...form, custo_base: e.target.value })} placeholder="Ex: 25.00" className={inputClass} />
              </div>
              {erro && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5">{erro}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={fecharModal} className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={handleSalvar} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">{produtoEditando ? 'Salvar alterações' : 'Criar produto'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal insumos */}
      {modalInsumoAberto && produtoSelecionado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Insumos do produto</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{produtoSelecionado.referencia} — {produtoSelecionado.descricao}</p>
              </div>
              <button onClick={fecharModalInsumo} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold">×</button>
            </div>

            <div className="mb-4">
              {insumosVinculados.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum insumo vinculado ainda.</p>
              ) : (
                <table className="w-full mb-2">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">Insumo</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">Qtd</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">Custo unit.</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4 py-2">Total</th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumosVinculados.map((pi: any, index: number) => (
                      <tr key={pi.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                        <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">{pi.nome}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{pi.quantidade}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">R$ {Number(pi.custo_unitario).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-100">R$ {Number(pi.custo_total_linha).toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <button onClick={() => handleRemoverVinculo(pi.id)} className="text-red-500 hover:underline text-xs">Remover</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adicionar insumo</p>
              <div className="flex gap-2">
                <select value={formInsumo.insumo_id} onChange={(e) => setFormInsumo({ ...formInsumo, insumo_id: e.target.value })} className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                  <option value="">Selecione o insumo</option>
                  {insumos.map((i) => (<option key={i.id} value={i.id}>{i.nome}</option>))}
                </select>
                <input type="number" value={formInsumo.quantidade} onChange={(e) => setFormInsumo({ ...formInsumo, quantidade: e.target.value })} placeholder="Qtd" step="0.01" className="w-24 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <button onClick={handleVincularInsumo} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 rounded-lg transition-colors">Adicionar</button>
              </div>
              {erro && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5 mt-3">{erro}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produtos;