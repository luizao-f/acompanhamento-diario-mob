
import { Button } from "@/components/ui/button";
import { Leaf, Heart, Droplet, Sun } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground animate-fade-in-up">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--secondary)),transparent)]"></div>
      </div>

      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <h1 className="text-2xl font-bold font-serif text-primary">Método Billings</h1>
        <nav>
          <Button asChild variant="ghost">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Criar Conta</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold font-serif leading-tight md:text-6xl">
          Conecte-se com seu <span className="text-primary">ciclo</span>.
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground">
          Uma jornada de autoconhecimento e bem-estar, em harmonia com a sua natureza. O Método Billings te guia com sensibilidade e precisão.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/register">Comece sua jornada</Link>
          </Button>
        </div>
      </main>

      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold font-serif text-center">Por que o Método Billings?</h3>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                <Leaf className="w-8 h-8"/>
              </div>
              <h4 className="text-xl font-semibold font-serif">Natural e Seguro</h4>
              <p className="mt-2 text-muted-foreground">Aprenda a reconhecer os sinais do seu corpo sem hormônios ou intervenções.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                <Heart className="w-8 h-8"/>
              </div>
              <h4 className="text-xl font-semibold font-serif">Saúde Feminina</h4>
              <p className="mt-2 text-muted-foreground">Monitore sua saúde ginecológica e hormonal de forma simples e eficaz.</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                <Droplet className="w-8 h-8"/>
              </div>
              <h4 className="text-xl font-semibold font-serif">Autoconhecimento</h4>
              <p className="mt-2 text-muted-foreground">Entenda as fases do seu ciclo e viva em maior sintonia com você mesma.</p>
            </div>
             <div className="flex flex-col items-center p-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent text-accent-foreground mb-4">
                <Sun className="w-8 h-8"/>
              </div>
              <h4 className="text-xl font-semibold font-serif">Planejamento Familiar</h4>
              <p className="mt-2 text-muted-foreground">Utilize o método para espaçar ou alcançar a gravidez de forma consciente.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-background">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 Método Billings. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
