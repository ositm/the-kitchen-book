export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <main className="flex flex-col items-center justify-center text-center p-8 bg-card rounded-2xl shadow-sm border border-border w-full">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
          The Kitchen Book
        </h1>
        <p className="text-lg text-foreground/80 mb-8 max-w-md">
          What can I cook with what I have? Enter your pantry, get recipes, and never waste food again.
        </p>
        <button className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
          Get Started
        </button>
      </main>
    </div>
  );
}
