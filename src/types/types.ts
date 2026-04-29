export interface Usuario {
  id: number;
  nome: string;
  email: string;
  criado_em?: string;
}

export interface Produto {
  id: number;
  referencia: string;
  descricao?: string;
  custo_base?: number;
  producao_mensal?: number;
  usuario_id?: number;
  criado_em?: string;
}

export interface Insumo {
  id: number;
  nome: string;
  custo_unitario: number;
  usuario_id?: number;
}

export interface ProdutoInsumo {
  id: number;
  produto_id: number;
  insumo_id: number;
  quantidade: number;
  insumo?: {
    id: number;
    nome: string;
    custo_unitario: number;
  };
}

export interface ContaPagar {
  id: number;
  descricao: string;
  valor: number;
  data_lancamento?: string;
  data_vencimento?: string;
  data_pagamento?: string;
  status?: string;
  usuario_id?: number;
}

export interface Imposto {
  id: number;
  nome: string;
  percentual: number;
}

export interface ConfiguracaoPrecificacao {
  id: number;
  lucro_percentual: number;
  usuario_id?: number;
}

export interface Simulacao {
  id: number;
  produto_id: number;
  preco_calculado: number;
  margem_usada: number;
  criado_em?: string;
  produto?: {
    id: number;
    referencia: string;
    descricao?: string;
  };
}

export interface ResultadoSimulacao {
  simulacao_id: number;
  produto: {
    id: number;
    referencia: string;
    descricao?: string;
    producao_mensal: number;
  };
  detalhamento: {
    custo_materia_prima: string;
    custo_rateado_despesas: string;
    custo_base: string;
    percentual_impostos: string;
    custo_com_imposto: string;
    markup_aplicado: number;
  };
  preco_venda_sugerido: string;
  criado_em?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nome: string;
}