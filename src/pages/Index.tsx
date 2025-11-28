import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, FileText, Zap, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if environment variables are set (for debugging)
    if (import.meta.env.DEV) {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) {
        console.warn("⚠️ Environment variables not set. Please configure them in Lovable Settings.");
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">Finance Agent</span>
          </div>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button variant="default" size="sm">
              {user ? "Dashboard" : "Login"}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Finance Automation
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Automate Your Finance Workflows with AI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload documents, extract insights, and automate complex financial workflows using intelligent AI agents that understand your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/dashboard" : "/login"}>
              <Button size="lg" className="gap-2">
                {user ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to automate finance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for modern finance teams
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Smart Document Processing
            </h3>
            <p className="text-muted-foreground">
              Upload invoices, receipts, and statements. Our AI extracts and organizes data automatically.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Instant Actions
            </h3>
            <p className="text-muted-foreground">
              Execute common workflows with one click. Categorize expenses, generate reports, and more.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              AI Assistant
            </h3>
            <p className="text-muted-foreground">
              Chat with your financial data. Ask questions, get insights, and make decisions faster.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to transform your finance workflows?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of finance teams already using Finance Agent
          </p>
          <Link to={user ? "/dashboard" : "/login"}>
            <Button size="lg" className="gap-2">
              {user ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Finance Agent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Finance Agent. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
