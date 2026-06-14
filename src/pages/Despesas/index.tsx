import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { ContaPagar } from '../../types/types';

const statusOpcoes = ['pendente', 'pago', 'vencido'];

const Despesas = () => {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [contaEditando, setContaEditando] = useState<ContaPagar | null>(null);

  const [form, setForm] = useState({
    descricao: '',
    valor: '',
    valor_pago: '',
    data_vencimento: '',
    data_pagamento: '',
    status: 'pendente',
  });

  const buscarContas = async () => {
    try {
      const { data } = await api.get<ContaPagar[]>('/contaspagar');
      setContas(data);
    } catch {
      setErro('Erro ao buscar despesas.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { buscarContas(); }, []);

  const abrirModalNovo = () => {
    setContaEditando(null);
    setForm({ descricao: '', valor: '', valor_pago: '', data_vencimento: '', data_pagamento: '', status: 'pendente' });
    setErro('');
    setModalAberto(true);
  };

  const abrirModalEditar = (conta: ContaPagar) => {
    setContaEditando(conta);
    setForm({
      descricao: conta.descricao,
      valor: conta.valor.toString(),
      valor_pago: conta.valor_pago?.toString() ?? '',
      data_vencimento: conta.data_vencimento?.substring(0, 10) ?? '',
      data_pagamento: conta.data_pagamento?.substring(0, 10) ?? '',
      status: conta.status ?? 'pendente',
    });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setErro('');
    setContaEditando(null);
    setForm({ descricao: '', valor: '', valor_pago: '', data_vencimento: '', data_pagamento: '', status: 'pendente' });
  };

  const handleSalvar = async () => {
    setErro('');

    if (!form.descricao) { setErro('A descrição é obrigatória.'); return; }
    if (!form.valor || Number(form.valor) <= 0) { setErro('Informe o valor da despesa.'); return; }
    if (!form.data_vencimento) { setErro('Informe a data de vencimento.'); return; }

    setSalvando(true);
    try {
      const payload = {
        descricao: form.descricao,
        valor: Number(form.valor),
        valor_pago: form.valor_pago ? Number(form.valor_pago) : null,
        data_vencimento: form.data_vencimento,
        data_pagamento: form.data_pagamento || null,
        status: form.status,
      };

      if (contaEditando) {
        await api.put(`/contaspagar/${contaEditando.id}`, payload);
      } else {
        await api.post('/contaspagar', payload);
      }

      fecharModal();
      await buscarContas();
      setSucesso(contaEditando ? 'Despesa atualizada com sucesso!' : 'Despesa criada com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error(error);
      setErro('Erro ao salvar despesa.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (!confirm('Deseja excluir esta despesa?')) return;
    try {
      await api.delete(`/contaspagar/${id}`);
      await buscarContas();
      setSucesso('Despesa excluída com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch {
      setErro('Erro ao excluir despesa.');
    }
  };

  const badgeStatus = (status?: string) => {
    const estilos: Record<string, string> = {
      pendente: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      pago: 'bg-green-50 text-green-700 border border-green-200',
      vencido: 'bg-red-50 text-red-600 border border-red-200',
    };
    return estilos[status ?? 'pendente'] ?? estilos['pendente'];
  };

  const totalMes = contas.reduce((s, c) => s + Number(c.valor), 0);
  const inputClass = 'w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Despesas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gerencie as contas a pagar da sua empresa</p>
        </div>
        <button onClick={abrirModalNovo} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          + Nova despesa
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total de despesas cadastradas</p>
          <p className="text-xs text-blue-400 dark:text-blue-500 mt-0.5">Usado no rateio da precificação</p>
        </div>
        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">R$ {totalMes.toFixed(2)}</p>
      </div>

      {sucesso && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm rounded-lg px-4 py-2.5 mb-4">
          {sucesso}
        </div>
      )}

      {erro && !modalAberto && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5 mb-4">
          {erro}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {carregando ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando...</div>
        ) : contas.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Nenhuma despesa cadastrada. Clique em "+ Nova despesa" para começar.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Descrição</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Valor</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Valor pago</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Vencimento</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Pagamento</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.map((conta, index) => (
                <tr key={conta.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-100">{conta.descricao}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    R$ {Number(conta.valor).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {conta.valor_pago ? `R$ ${Number(conta.valor_pago).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {conta.data_vencimento
                      ? new Date(conta.data_vencimento.substring(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {conta.data_pagamento
                      ? new Date(conta.data_pagamento.substring(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeStatus(conta.status)}`}>
                      {conta.status ?? 'pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-3">
                    <button onClick={() => abrirModalEditar(conta)} className="text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => handleExcluir(conta.id)} className="text-red-500 hover:underline">Excluir</button>
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

            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {contaEditando ? 'Editar despesa' : 'Nova despesa'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição *</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Aluguel do galpão"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$) *</label>
                <input
                  type="number"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="Ex: 1500.00"
                  step="0.01"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor pago (R$)</label>
                <input
                  type="number"
                  value={form.valor_pago}
                  onChange={(e) => setForm({ ...form, valor_pago: e.target.value })}
                  placeholder="Ex: 1500.00"
                  step="0.01"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de vencimento *</label>
                <input
                  type="date"
                  value={form.data_vencimento}
                  onChange={(e) => setForm({ ...form, data_vencimento: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de pagamento</label>
                <input
                  type="date"
                  value={form.data_pagamento}
                  onChange={(e) => setForm({ ...form, data_pagamento: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass}
                >
                  {statusOpcoes.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>

              {erro && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2.5">
                  {erro}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharModal}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={salvando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
              >
                {salvando ? 'Salvando...' : contaEditando ? 'Salvar alterações' : 'Criar despesa'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Despesas;