
import { Button } from "@/components/ui/button";
import { Leaf, Flower, TreeDeciduous } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground animate-organic-fade" style={{
      backgroundImage:
        // Fundo aquarelado com textura
        "url('https://www.transparenttextures.com/patterns/paper-fibers.png'), linear-gradient(117deg, #fdefed 0%, #f9f4e7 47%, #e1efe4 100%)",
      backgroundBlendMode: "lighten"
    }}>
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-85 bg-none">
        {/* Shapes decorativas aquareladas */}
        <svg className="absolute left-0 top-0 w-48 h-48 opacity-70 hidden md:block" viewBox="0 0 200 200">
          <ellipse cx="90" cy="90" rx="90" ry="70" fill="#fde4ec" />
          <ellipse cx="160" cy="80" rx="40" ry="20" fill="#e7dccb" />
        </svg>
        <svg className="absolute right-4 top-14 w-52 h-40 opacity-40 mix-blend-multiply hidden lg:block" viewBox="0 0 220 150">
          <circle cx="90" cy="60" r="60" fill="#e1efe4"/>
          <ellipse cx="160" cy="100" rx="45" ry="26" fill="#ded9f6" />
        </svg>
      </div>
      <header className="container mx-auto flex h-24 items-center justify-between px-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary flex items-center gap-2">
          <Leaf className="inline-block w-8 h-8 text-secondary" aria-label="Folha símbolo" />
          Método Billings
        </h1>
        <nav>
          <Button asChild variant="ghost" className="rounded-xl mr-1">
            <Link to="/login">Entrar</Link>
          </Button>
          <Button asChild className="rounded-[2rem] shadow-nature">
            <Link to="/register">Criar Conta</Link>
          </Button>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-16 text-center bg-white/75 rounded-3xl shadow-nature backdrop-blur-[2px] mt-8">
        <h2 className="text-5xl md:text-6xl font-bold font-serif leading-tight text-accent-foreground">
          Conecte-se com seu <span className="text-primary">ciclo</span>.
        </h2>
        <p className="mt-7 max-w-2xl mx-auto text-xl text-muted-foreground font-sans">
          Uma jornada de autoconhecimento e bem-estar, em harmonia com a sua natureza. O Método Billings te guia com sensibilidade e precisão.
        </p>
        <div className="mt-10 flex justify-center">
          <Button asChild size="lg" className="rounded-full px-14 py-4 text-lg shadow-soft">
            <Link to="/register">Comece sua jornada</Link>
          </Button>
        </div>
      </main>
      <section id="features" className="py-20 bg-white/70 rounded-3xl mx-2 my-10 shadow-nature backdrop-blur-[1.5px]">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-semibold font-serif text-center text-secondary-foreground">Por que o Método Billings?</h3>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            <div className="flex flex-col items-center p-5 rounded-2xl bg-accent/20 shadow-soft">
              <Leaf className="w-14 h-14 text-primary mb-3" aria-label="Folha" />
              <h4 className="text-xl font-semibold font-serif">Natural e Seguro</h4>
              <p className="mt-2 text-muted-foreground">Reconheça os sinais do seu corpo sem hormônios, só com autoconhecimento.</p>
            </div>
            <div className="flex flex-col items-center p-5 rounded-2xl bg-accent/20 shadow-soft">
              <Flower className="w-14 h-14 text-secondary mb-3" aria-label="Flor" />
              <h4 className="text-xl font-semibold font-serif">Saúde Feminina</h4>
              <p className="mt-2 text-muted-foreground">Monitore sua saúde ginecológica em conexão com a natureza feminina.</p>
            </div>
            <div className="flex flex-col items-center p-5 rounded-2xl bg-muted/30 shadow-soft">
              <TreeDeciduous className="w-14 h-14 text-accent mb-3" aria-label="Árvore" />
              <h4 className="text-xl font-semibold font-serif">Autoconhecimento</h4>
              <p className="mt-2 text-muted-foreground">Entenda as fases do seu ciclo e viva em sintonia com você mesma.</p>
            </div>
            <div className="flex flex-col items-center p-5 rounded-2xl bg-muted/30 shadow-soft">
              <Flower className="w-14 h-14 text-primary mb-3" aria-label="Flor estilizada" />
              <h4 className="text-xl font-semibold font-serif">Planejamento Consciente</h4>
              <p className="mt-2 text-muted-foreground">Espaçar ou buscar a gravidez de forma natural e consciente.</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-12 bg-background/80">
        <div className="container mx-auto text-center text-muted-foreground font-sans">
          <p>&copy; 2025 Método Billings. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
export default Index;
