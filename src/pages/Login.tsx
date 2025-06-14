
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Flower, Heart, Leaf } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      toast({
        title: "Bem-vinda! ✨",
        description: "Login realizado com sucesso. Que bom ter você aqui!"
      });
    } else {
      toast({
        title: "Oops! 💗",
        description: "Usuário ou senha incorretos. Tente novamente com carinho.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/5 to-primary/5 p-4 relative overflow-hidden texture-watercolor">
      {/* Elementos decorativos naturais */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/8 rounded-full blur-3xl animate-breathe" />
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-sway" />
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-secondary/8 rounded-full blur-xl animate-bloom" />

      <Card className="w-full max-w-md shadow-gentle backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative animate-breathe">
              <div className="p-4 bg-primary/12 rounded-petal shadow-soft">
                <Flower className="h-12 w-12 text-primary" />
              </div>
              <Heart className="absolute -top-1 -right-1 h-6 w-6 text-accent animate-bloom" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-crimson text-primary">
            Método Billings
          </CardTitle>
          <CardDescription className="text-base font-inter leading-relaxed opacity-90">
            Entre na sua conta para continuar sua jornada de autoconhecimento e bem-estar
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-sm font-medium text-foreground font-inter">
                Usuário
              </Label>
              <Input 
                id="username" 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Digite seu usuário" 
                required 
                className="transition-all duration-300 hover-lift"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-foreground font-inter">
                Senha
              </Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Digite sua senha" 
                required 
                className="transition-all duration-300 hover-lift"
              />
            </div>
            
            <Button type="submit" className="w-full h-12 text-base shadow-warm">
              <Leaf className="mr-2 h-5 w-5" />
              Entrar
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground font-inter opacity-80">
              Cuide de si com amor e consciência 💗
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
