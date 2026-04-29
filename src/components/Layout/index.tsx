import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const menus = [
  { label: 'Produtos', path: '/produtos' },
  { label: 'Insumos', path: '/insumos' },
  { label: 'Despesas', path: '/despesas' },
  { label: 'Impostos', path: '/impostos' },
  { label: 'Configuração', path: '/configuracao' },
  { label: 'Simulação', path: '/simulacao' },
];

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const nome = localStorage.getItem('nome') ?? 'Usuário';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Menu lateral */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">SmartPrice</h1>
          <p className="text-xs text-gray-400 mt-0.5">Gestão de preços</p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menus.map((menu) => {
            const ativo = location.pathname === menu.path;
            return (
              <button
                key={menu.path}
                onClick={() => navigate(menu.path)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  ativo
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {menu.label}
              </button>
            );
          })}
        </nav>

        {/* Usuário logado + logout */}
        <div className="px-4 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-0.5">Logado como</p>
          <p className="text-sm font-medium text-gray-700 truncate">{nome}</p>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-left text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Sair
          </button>
        </div>

      </aside>

      {/* Conteúdo principal */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>

    </div>
  );
};

export default Layout;