
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Leaf } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const {
    isAuthenticated,
    login
  } = useAuth();
  const {
    toast
  } = useToast();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao sistema Método Billings"
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/40 via-background/80 to-primary/10 py-8 px-2 animate-organic-fade" style={{
      backgroundImage:
        "url('https://www.transparenttextures.com/patterns/paper-fibers.png'), linear-gradient(109deg, #fde4ec 20%, #fdf6e3 60%, #ded9f6 100%)",
      backgroundRepeat: "repeat, no-repeat",
      backgroundBlendMode: "lighten"
    }}>
      <div className="absolute inset-0 flex justify-center items-start">
        {/* Decoração aquarela folha */}
        <Leaf className="w-24 h-24 text-accent/30 mt-24" />
      </div>
      <Card className="w-full max-w-md bg-card/90 rounded-3xl shadow-nature backdrop-blur-md border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
            <Leaf className="w-8 h-8 text-secondary" />
            Bem-vinda de volta
          </CardTitle>
          <CardDescription className="font-sans text-muted-foreground">Acesse sua conta para continuar sua jornada.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Seu nome de usuário" required autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" required />
            </div>
            <Button type="submit" className="w-full rounded-full shadow-soft" size="lg">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
export default Login;
