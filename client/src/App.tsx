import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={Home} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Prevent unwanted focus and cursor behavior
    const preventUnwantedFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      
      // Allow focus only on actual input elements
      if (target && !['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(target.tagName)) {
        target.blur();
      }
    };

    const preventUnwantedSelection = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Prevent text selection on non-input elements
      if (target && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('focusin', preventUnwantedFocus);
    document.addEventListener('selectstart', preventUnwantedSelection);
    
    // Cleanup
    return () => {
      document.removeEventListener('focusin', preventUnwantedFocus);
      document.removeEventListener('selectstart', preventUnwantedSelection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
