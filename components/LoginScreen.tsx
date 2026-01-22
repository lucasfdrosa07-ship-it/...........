import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState(''); // New State for API Key
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved API key if exists
  useEffect(() => {
    const savedKey = localStorage.getItem('USER_GEMINI_KEY');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // Save API Key if provided
        if (apiKey.trim()) {
            localStorage.setItem('USER_GEMINI_KEY', apiKey.trim().replace(/\s/g, ''));
        }

        // Simple delay to simulate network request for better UX feel
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isRegistering) {
            if (!name || !email || !password) throw new Error("Preencha todos os campos.");
            const user = AuthService.register(name, email, password);
            login(user);
        } else {
            if (!email || !password) throw new Error("Preencha email e senha.");
            const user = AuthService.login(email, password);
            login(user);
        }
    } catch (err: any) {
        setError(err.message || "Erro ao autenticar.");
    } finally {
        setLoading(false);
    }
  };

  const isValidKeyFormat = apiKey.trim().startsWith('AIza');

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-10">
            <div className="w-8 h-8 bg-[#E50914] transform rotate-45 mx-auto mb-4"></div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">O MENTOR</h1>
            <p className="text-[#666] font-mono text-xs mt-2 uppercase tracking-widest">Acesso Restrito ao Código</p>
        </div>

        {/* Card */}
        <div className="bg-[#0F0F0F] border border-[#222] p-8 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
             {/* Red Glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#E50914] blur-[80px] opacity-10"></div>

             <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                {isRegistering ? 'INICIAR JORNADA' : 'IDENTIFICAÇÃO'}
             </h2>

             {error && (
                 <div className="bg-red-900/20 border border-red-900 text-red-400 p-3 rounded text-sm mb-6 animate-pulse font-mono">
                     ⚠ {error}
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                    <div>
                        <label className="block text-[10px] uppercase text-[#666] font-bold mb-1">Nome de Guerra</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-[#050505] border border-[#333] text-white p-3 rounded focus:border-[#E50914] focus:outline-none transition-colors placeholder-[#333]"
                            placeholder="Seu nome"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-[10px] uppercase text-[#666] font-bold mb-1">E-mail</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#050505] border border-[#333] text-white p-3 rounded focus:border-[#E50914] focus:outline-none transition-colors placeholder-[#333]"
                        placeholder="seuemail@gmail.com"
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase text-[#666] font-bold mb-1">Senha de Acesso</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#050505] border border-[#333] text-white p-3 rounded focus:border-[#E50914] focus:outline-none transition-colors placeholder-[#333]"
                        placeholder="••••••••"
                    />
                </div>

                {/* API Key Input */}
                <div className="pt-4 border-t border-[#222] mt-4">
                    <label className="block text-[10px] uppercase text-[#FFD700] font-bold mb-1 flex justify-between">
                        Chave API Gemini
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline opacity-50 hover:opacity-100">Obter Chave</a>
                    </label>
                    <input 
                        type="password" 
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        className={`w-full bg-[#111] border ${apiKey && !isValidKeyFormat ? 'border-red-500 text-red-500' : 'border-[#333] text-[#FFD700]'} p-3 rounded focus:outline-none transition-colors placeholder-[#444] font-mono text-xs`}
                        placeholder="Cole sua chave AI Studio aqui..."
                    />
                     {apiKey && !isValidKeyFormat && (
                        <p className="text-[9px] text-red-500 mt-1">A chave deve começar com "AIza..."</p>
                    )}
                    <p className="text-[9px] text-[#555] mt-1">
                        Sua chave é salva localmente e usada para conectar o Mentor.
                    </p>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || (apiKey.length > 0 && !isValidKeyFormat)}
                    className="w-full bg-[#E50914] text-white font-black uppercase py-4 rounded hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        isRegistering ? 'CRIAR ACESSO' : 'EXECUTAR LOGIN'
                    )}
                </button>
             </form>

             <div className="mt-6 text-center">
                 <button 
                    type="button"
                    onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                    className="text-xs text-[#666] hover:text-white transition-colors uppercase font-bold tracking-wider"
                 >
                     {isRegistering ? 'Já possui acesso? Entrar' : 'Novo recruta? Cadastre-se'}
                 </button>
             </div>
        </div>
        
        <p className="text-center text-[#333] text-[10px] mt-8 font-mono">
            SISTEMA SEGURO. DADOS LOCAIS.
        </p>

      </div>
    </div>
  );
};

export default LoginScreen;