import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Importamos o contexto

export function useLogin() {
    const navigate = useNavigate();
    const { signIn } = useAuth(); // Pegamos a função que atualiza o estado global
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            
            // --- DEBUG ---
            console.log("🔥 Resposta Bruta da API:", response.data);

            const responseBody = response.data;

            // 1. Extração robusta dos dados
            const token = responseBody.token || responseBody.data?.token;
            let user = responseBody.user;
            if (!user && responseBody.data) {
                user = responseBody.data.user || responseBody.data;
            }

            if (!user || !token) {
                throw new Error("Formato de resposta inválido.");
            }

            // 2. SUCESSO: Chama o signIn do Contexto
            // Isso salva no storage E atualiza o Sidebar instantaneamente
            signIn(user, token);

            console.log(`✅ Login efetuado: ${user.role}`);

            // 3. Redirecionamento
            switch (user.role.toLowerCase()) {
                case 'admin':
                    navigate('/users'); 
                    break;
                case 'proprietario':
                    navigate('/dashboard'); 
                    break;
                case 'atendente':
                    navigate('/rentals'); 
                    break;
                case 'cliente':
                     navigate('/client-area'); 
                     break;
                default:
                    console.warn("⚠️ Role desconhecida.");
                    navigate('/home');
            }

        } catch (err: any) {
            console.error("❌ Erro no Login:", err);

            // 4. Lógica de Troca de Senha Obrigatória
            // Se o backend retornar 403 com código específico, redireciona
            if (err.response && err.response.status === 403) {
                const { code, token } = err.response.data;
                
                if (code === 'PASSWORD_CHANGE_REQUIRED') {
                    // Redireciona para troca de senha levando o token temporário
                    navigate('/auth/change-password', { 
                        state: { tempToken: token } 
                    });
                    return; // Para a execução aqui
                }
            }

            // Tratamento de mensagem de erro genérica
            const msg = err.response?.data?.message || err.message || 'Falha ao conectar com o servidor.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return {
        email, setEmail,
        password, setPassword,
        loading, error,
        handleSubmit
    };
}