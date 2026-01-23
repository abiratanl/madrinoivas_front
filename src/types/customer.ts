// 1. Interface de Contatos (Baseado na sua tabela 'contacts')
export interface Contact {
  id?: string;
  customer_id?: string;
  type: 'whatsapp' | 'mobile' | 'email' | 'phone';
  value: string;
  is_primary: boolean | number;
  is_active: boolean;
}

// 2. Interface de Endereços (Baseado na sua tabela 'addresses')
export interface Address {
  id?: string;
  customer_id?: string;
  type: 'residential' | 'commercial' | 'delivery';
  label: string; // Ex: 'Casa', 'Trabalho'
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean | number;
}

// 3. Interface das Medidas (O JSON definido no banco)
export interface CustomerMeasurements {
  busto?: string;
  cintura?: string;
  quadril?: string;
  altura?: string;
  ombro_a_ombro?: string;
  comprimento_braco?: string;
  [key: string]: any; // Permite campos extras se necessário
}

// 4. Interface Principal (Baseado na tabela 'customers')
export interface Customer {
  id: string;
  name: string;
  rg?: string;
  cpf?: string;
  birth_date?: string;
  measurements?: CustomerMeasurements;
  notes?: string;
  is_active: number | boolean;
  status_updated_at?: string;
  status_updated_by?: string;
  created_at?: string;
  updated_at?: string;

  // Dados que vêm da query otimizada do findAll
  main_phone?: string;
  city?: string;

  // Dados que vêm do findById (arrays aninhados)
  addresses?: Address[];
  contacts?: Contact[];
}