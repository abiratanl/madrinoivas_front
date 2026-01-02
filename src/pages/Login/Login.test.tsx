import { render, screen, fireEvent } from '../../utils/test-utils';
import Login from './index';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { useLogin } from '../../hooks/useLogin';

// 1. Mock do Hook: Nós "sequestramos" o hook para controlar o que ele retorna
vi.mock('../../hooks/useLogin', () => ({
  useLogin: vi.fn(),
}));

describe('Página de Login', () => {
  
  // Helper para resetar o mock antes de cada teste
  const mockUseLogin = useLogin as Mock;

  it('deve renderizar os campos corretamente (Estado Inicial)', () => {
    // Simulamos o retorno padrão do hook
    mockUseLogin.mockReturnValue({
      email: '', setEmail: vi.fn(),
      password: '', setPassword: vi.fn(),
      loading: false,
      error: '',
      handleSubmit: vi.fn()
    });

    render(<Login />);

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeEnabled();
  });

  it('deve desabilitar o botão e mudar o texto quando estiver Carregando', () => {
    // Simulamos que o hook está processando (loading: true)
    mockUseLogin.mockReturnValue({
      email: 'teste@teste.com', setEmail: vi.fn(),
      password: '123', setPassword: vi.fn(),
      loading: true, 
      error: '',
      handleSubmit: vi.fn()
    });

    render(<Login />);

    const button = screen.getByText(/entrar|entrando/i);
    
    // Verifica se mudou o texto
    expect(button).toHaveTextContent(/Entrando.../i);
    // Verifica se está desabilitado (para evitar múltiplos cliques)
    expect(button).toBeDisabled();
  });

  it('deve exibir mensagem de erro quando o login falhar', () => {
    // Simulamos que o hook retornou um erro
    mockUseLogin.mockReturnValue({
      email: '', setEmail: vi.fn(),
      password: '', setPassword: vi.fn(),
      loading: false,
      error: 'Credenciais Inválidas', // <--- SIMULANDO ERRO
      handleSubmit: vi.fn()
    });

    render(<Login />);

    // Verifica se o alerta vermelho apareceu
    expect(screen.getByText('Credenciais Inválidas')).toBeInTheDocument();
  });

  it('deve chamar a função de submit ao enviar o formulário', () => {
    const handleSubmitMock = vi.fn((e) => e.preventDefault());

    mockUseLogin.mockReturnValue({
      email: 'admin@teste.com', setEmail: vi.fn(),
      password: 'b', setPassword: vi.fn(),
      loading: false,
      error: '',
      handleSubmit: handleSubmitMock
    });

    render(<Login />);

    // Simula o clique
    const button = screen.getByRole('button', { name: /Entrar/i });
    fireEvent.click(button);

    // Verifica se a função vinda do hook foi chamada
    expect(handleSubmitMock).toHaveBeenCalled();
  });

});