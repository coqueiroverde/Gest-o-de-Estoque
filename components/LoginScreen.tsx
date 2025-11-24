import React, { useState } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate network delay for Google Auth
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-400 blur-[100px]"></div>
         <div className="absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-400 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in-up">
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800 opacity-90"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-4 shadow-lg">
              <ChefHat className="text-white w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">GESTÃO DE ESTOQUE</h1>
            <p className="text-emerald-100 font-medium text-sm tracking-wide uppercase">Grupo Coqueiro Verde</p>
          </div>
        </div>

        <div className="p-8 pb-12">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Bem-vindo de volta!</h2>
            <p className="text-slate-500 text-sm">Acesse o controle de estoque utilizando sua conta corporativa.</p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-emerald-600" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Entrar com Google</span>
              </>
            )}
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Acesso restrito a colaboradores autorizados do Grupo Coqueiro Verde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};