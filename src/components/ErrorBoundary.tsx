import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
          <div className="max-w-md w-full border border-accent bg-accent/10 p-8 text-center space-y-6">
            <div className="mx-auto w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-accent mb-2">Something went wrong</h1>
              <p className="text-muted-foreground text-sm">
                The application encountered an unexpected error.
              </p>
            </div>
            
            <div className="text-left bg-background p-4 border border-border text-xs text-muted-foreground font-mono overflow-auto max-h-32">
              {this.state.error?.message || "Unknown error"}
            </div>

            <Button onClick={() => window.location.href = '/'} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" /> Restart Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
