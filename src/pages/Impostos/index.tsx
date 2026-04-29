import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Imposto } from '../../types/types';

const Impostos = () => {
  const [impostos, setImpostos] = useState<Imposto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [impostoEditando, setImpostoEditando] = useState<Imposto | null>(null);

  const [form, setForm] = useState({ nome: '', percentual: '' });

  const buscarImpostos = async () => {
    try {
      const { data } = await api.get<Imposto[]>('/impostos');
      setImpostos(data);
    } catch {
      setErro('Erro ao buscar impostos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscarImpostos(); }, []);

  const abrirModalNovo = () => {
    setImpostoEditando(null);
    setForm({ nome: '', percentual: '' });
    setErro('');
    setModalAberto(true);
  };

  const abrirModalEditar = (imposto: Imposto) => {
    setImpostoEditando(imposto);
    setForm({ nome: imposto.nome, percentual: imposto.percentual.toString() });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErro('');
    setImpostoEditando(null);
    setForm({ nome: '', percentual: '' });
  };

  const handleSalvar = async () => {
    setErro('');
    if (!form.nome) { setErro('O nome é obrigatório.'); return; }
    if (!form.percentual || Number(form.percentual) <= 0) { setErro('Informe o percentual do imposto.'); return; }

    setSalvando(true);
    try {
      const payload = { nome: form.nome, percentual: Number(form.percentual) };
      if (impostoEditando) {
        await api.put(`/impostos/${impostoEditando.id}`, payload);
      } else {
        await api.post('/impostos', payload);
      }
      fecharModal();
      await buscarImpostos();
      setSucesso(impostoEditando ? 'Imposto atualizado com sucesso!' : 'Imposto criado com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErro('Já existe um imposto com esse nome.');
      } else {
        setErro('Erro ao salvar imposto.');
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Deseja excluir este imposto?')) return;
    try {
      await api.delete(`/impostos/${id}`);
      await buscarImpostos();
      setSucesso('Imposto excluído com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch {
      setErro('Erro ao excluir imposto.');
    }
  };

  const totalPercentual = impostos.reduce((s, i) => s + Number(i.percentual), 0);
  const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Impostos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure os impostos aplicados na precificação</p>
        </div>
        <button onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">+ Novo imposto</button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total de impostos aplicados</p>
          <p className="text-xs text-blue-400 dark:text-blue-500 mt-0.5">Percentual somado no custo de cada produto</p>
        </div>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{totalPercentual.toFixed(2)}%</p>
      </div>

      {sucesso && <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-2.5 mb-4">{sucesso}</div>}
      {erro && !modalAberto && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">{erro}</div>}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {carregando ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : impostos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhum imposto cadastrado. Clique em "+ Novo imposto" para começar.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Percentual</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {impostos.map((imposto, index) => (
                <tr key={imposto.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">{imposto.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{Number(imposto.percentual).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <button onClick={() => abrirModalEditar(imposto)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleExcluir(imposto.id)} className="text-red-500 hover:underline">Excluir</button>
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
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{impostoEditando ? 'Editar imposto' : 'Novo imposto'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Simples Nacional" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Percentual (%) *</label>
                <input type="number" value={form.percentual} onChange={(e) => setForm({ ...form, percentual: e.target.value })} placeholder="Ex: 6.00" step="0.01" className={inputClass} />
              </div>
              {erro && <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5">{erro}</div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={fecharModal} className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">{salvando ? 'Salvando...' : impostoEditando ? 'Salvar alterações' : 'Criar imposto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Impostos;