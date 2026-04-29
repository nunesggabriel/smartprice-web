import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Cadastro = () => {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  const handleCadastrar = async () => {
    setErro('');

    if (!form.nome || !form.email || !form.senha || !form.confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/usuarios', {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
      });
      setSucesso('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErro('Já existe uma conta com esse email.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">SmartPrice</h1>
          <p className="text-gray-500 text-sm mt-1">Crie sua conta gratuitamente</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCadastrar();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Seu nome completo"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={form.senha}
              onChange={(e) => setForm({ ...form, senha: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              type="password"
              value={form.confirmarSenha}
              onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
              placeholder="Repita a senha"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2.5">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <a href="/login" className="text-blue-600 hover:underline font-medium">
            Faça login
          </a>
        </p>

      </div>
    </div>
  );
};

export default Cadastro;