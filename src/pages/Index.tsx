
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flower, Heart, Leaf, Sun, Droplets } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 texture-watercolor">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
        
        {/* Elementos decorativos naturais */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/8 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-sway" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-secondary/6 rounded-full blur-xl animate-bloom" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-primary/10 rounded-petal shadow-gentle animate-breathe">
              <Flower className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-crimson font-semibold text-foreground mb-6 leading-tight">
            Método
            <span className="text-primary block animate-sway">Billings</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-inter max-w-3xl mx-auto mb-12 leading-relaxed opacity-90">
            Conecte-se com seu ciclo natural. Acompanhe, compreenda e celebre sua fertilidade 
            com consciência, cuidado e amor próprio.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/calendar">
              <Button size="lg" className="text-lg px-8 py-4 shadow-warm">
                <Calendar className="mr-2 h-5 w-5" />
                Começar Jornada
              </Button>
            </Link>
            <Link to="/comparison">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                <Heart className="mr-2 h-5 w-5" />
                Comparar Ciclos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-crimson font-semibold text-foreground mb-6 animate-sway">
            Sua jornada de autoconhecimento
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto leading-relaxed opacity-90">
            Ferramentas intuitivas para acompanhar seu ciclo menstrual com precisão, carinho e respeito ao seu ritmo natural
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:scale-105 transition-transform duration-500 animate-breathe">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-primary/10 rounded-petal shadow-soft">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Calendário Intuitivo</CardTitle>
              <CardDescription>
                Registre seus sintomas diários com facilidade e visualize padrões únicos do seu ciclo natural
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-500 animate-breathe" style={{ animationDelay: '0.5s' }}>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-secondary/10 rounded-petal shadow-soft">
                  <Leaf className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-xl">Método Natural</CardTitle>
              <CardDescription>
                Baseado no método científico Billings, respeitando e celebrando o ritmo natural do seu corpo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-500 animate-breathe" style={{ animationDelay: '1s' }}>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-accent/10 rounded-petal shadow-soft">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-xl">Cuidado Integral</CardTitle>
              <CardDescription>
                Insights personalizados para compreender melhor sua saúde reprodutiva, bem-estar e autoconhecimento
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Cycle Awareness Section */}
      <div className="bg-gradient-rose-earth py-20 texture-linen">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-8 flex justify-center space-x-4">
            <div className="p-3 bg-destructive/10 rounded-full shadow-soft animate-bloom">
              <Droplets className="h-6 w-6 text-destructive" />
            </div>
            <div className="p-3 bg-accent/10 rounded-full shadow-soft animate-bloom" style={{ animationDelay: '0.5s' }}>
              <Sun className="h-6 w-6 text-accent" />
            </div>
            <div className="p-3 bg-secondary/10 rounded-full shadow-soft animate-bloom" style={{ animationDelay: '1s' }}>
              <Leaf className="h-6 w-6 text-secondary" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-crimson font-semibold text-foreground mb-6">
            Compreenda seu ciclo natural
          </h2>
          <p className="text-lg text-muted-foreground font-inter mb-8 leading-relaxed opacity-90">
            Cada fase do seu ciclo é única e preciosa. Aprenda a reconhecer os sinais do seu corpo 
            e viva em harmonia com sua natureza feminina.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-earth-sage py-20 texture-paper">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="mb-8 animate-sway">
            <Flower className="h-12 w-12 text-primary mx-auto opacity-80" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-crimson font-semibold text-foreground mb-6">
            Comece sua jornada hoje
          </h2>
          <p className="text-lg text-muted-foreground font-inter mb-8 leading-relaxed opacity-90">
            Descubra a beleza e sabedoria do seu ciclo natural. Cada dia é uma oportunidade 
            de se conectar mais profundamente consigo mesma.
          </p>
          <Link to="/calendar">
            <Button size="lg" className="text-lg px-10 py-4 shadow-warm">
              <Heart className="mr-2 h-5 w-5" />
              Iniciar Acompanhamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Elementos decorativos flutuantes */}
      <div className="fixed top-1/4 left-4 w-2 h-2 bg-primary/20 rounded-full animate-bloom" />
      <div className="fixed top-3/4 right-8 w-3 h-3 bg-accent/20 rounded-full animate-sway" />
      <div className="fixed bottom-1/4 left-1/3 w-1 h-1 bg-secondary/30 rounded-full animate-breathe" />
    </div>
  );
};

export default Index;
