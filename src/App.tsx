import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="min-w-screen flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Welcome to My App</h1>
      <p className="text-lg mb-6">This is a simple React application.</p>
      <Button>Click me</Button>
    </div>
  );
}

export default App;
