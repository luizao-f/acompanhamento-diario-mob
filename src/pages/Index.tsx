
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flower, Heart, Leaf } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse-soft" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full shadow-soft">
              <Flower className="h-16 w-16 text-primary animate-pulse-soft" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-playfair font-medium text-foreground mb-6 leading-tight">
            Método
            <span className="text-primary block">Billings</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-inter max-w-3xl mx-auto mb-12 leading-relaxed">
            Conecte-se com seu ciclo natural. Acompanhe, compreenda e celebre sua fertilidade 
            com consciência e cuidado.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/calendar">
              <Button size="lg" className="text-lg px-8 py-4">
                <Calendar className="mr-2 h-5 w-5" />
                Começar Agora
              </Button>
            </Link>
            <Link to="/comparison">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Comparar Ciclos
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-playfair font-medium text-foreground mb-6">
            Sua jornada de autoconhecimento
          </h2>
          <p className="text-lg text-muted-foreground font-inter max-w-2xl mx-auto leading-relaxed">
            Ferramentas intuitivas para acompanhar seu ciclo menstrual com precisão e carinho
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-primary/10 rounded-petal">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Calendário Inteligente</CardTitle>
              <CardDescription>
                Registre seus sintomas diários com facilidade e visualize padrões únicos do seu ciclo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-secondary/10 rounded-petal">
                  <Leaf className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-xl">Método Natural</CardTitle>
              <CardDescription>
                Baseado no método científico Billings, respeitando o ritmo natural do seu corpo
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:scale-105 transition-transform duration-300">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-accent/10 rounded-petal">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
              </div>
              <CardTitle className="text-xl">Cuidado Pessoal</CardTitle>
              <CardDescription>
                Insights personalizados para compreender melhor sua saúde reprodutiva e bem-estar
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-playfair font-medium text-foreground mb-6">
            Comece sua jornada hoje
          </h2>
          <p className="text-lg text-muted-foreground font-inter mb-8 leading-relaxed">
            Descubra a beleza e sabedoria do seu ciclo natural
          </p>
          <Link to="/calendar">
            <Button size="lg" className="text-lg px-10 py-4 shadow-petal">
              Iniciar Acompanhamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="fixed top-1/4 left-4 w-2 h-2 bg-primary/20 rounded-full animate-pulse-soft" />
      <div className="fixed top-3/4 right-8 w-3 h-3 bg-accent/20 rounded-full animate-float" />
      <div className="fixed bottom-1/4 left-1/3 w-1 h-1 bg-secondary/30 rounded-full animate-pulse-soft" />
    </div>
  );
};

export default Index;
