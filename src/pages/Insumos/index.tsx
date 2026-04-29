import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Insumo } from '../../types/types';

const Insumos = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);

  const [form, setForm] = useState({ nome: '', custo_unitario: '' });

  const buscarInsumos = async () => {
    try {
      const { data } = await api.get<Insumo[]>('/insumos');
      setInsumos(data);
    } catch {
      setErro('Erro ao buscar insumos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscarInsumos(); }, []);

  const abrirModalNovo = () => {
    setInsumoEditando(null);
    setForm({ nome: '', custo_unitario: '' });
    setErro('');
    setModalAberto(true);
  };

  const abrirModalEditar = (insumo: Insumo) => {
    setInsumoEditando(insumo);
    setForm({ nome: insumo.nome, custo_unitario: insumo.custo_unitario.toString() });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErro('');
    setInsumoEditando(null);
    setForm({ nome: '', custo_unitario: '' });
  };

  const handleSalvar = async () => {
    setErro('');
    if (!form.nome) { setErro('O nome é obrigatório.'); return; }
    if (!form.custo_unitario || Number(form.custo_unitario) <= 0) { setErro('Informe o custo unitário.'); return; }

    setSalvando(true);
    try {
      const payload = { nome: form.nome, custo_unitario: Number(form.custo_unitario) };
      if (insumoEditando) {
        await api.put(`/insumos/${insumoEditando.id}`, payload);
      } else {
        await api.post('/insumos', payload);
      }
      fecharModal();
      await buscarInsumos();
      setSucesso(insumoEditando ? 'Insumo atualizado com sucesso!' : 'Insumo criado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErro('Já existe um insumo com esse nome.');
      } else {
        setErro('Erro ao salvar insumo.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Deseja excluir este insumo?')) return;
    try {
      await api.delete(`/insumos/${id}`);
      await buscarInsumos();
      setSucesso('Insumo excluído com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch {
      setErro('Erro ao excluir insumo.');
    }
  };

  const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Insumos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Cadastre a matéria prima utilizada nos produtos</p>
        </div>
        <button onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">+ Novo insumo</button>
      </div>

      {sucesso && <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-2.5 mb-4">{sucesso}</div>}
      {erro && !modalAberto && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">{erro}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {carregando ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : insumos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhum insumo cadastrado. Clique em "+ Novo insumo" para começar.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Custo unitário</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((insumo, index) => (
                <tr key={insumo.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">{insumo.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">R$ {Number(insumo.custo_unitario).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <button onClick={() => abrirModalEditar(insumo)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleExcluir(insumo.id)} className="text-red-500 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{insumoEditando ? 'Editar insumo' : 'Novo insumo'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Tecido malha fria" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custo unitário (R$) *</label>
                <input type="number" value={form.custo_unitario} onChange={(e) => setForm({ ...form, custo_unitario: e.target.value })} placeholder="Ex: 8.50" step="0.01" className={inputClass} />
              </div>
              {erro && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5">{erro}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={fecharModal} className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">{salvando ? 'Salvando...' : insumoEditando ? 'Salvar alterações' : 'Criar insumo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insumos;