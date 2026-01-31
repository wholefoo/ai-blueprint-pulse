import { Compass } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Compass className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Blueprint Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Actionable business guides powered by AI research and expert insights.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/marketplace?tier=starter" className="hover:text-foreground transition-colors">
                  Starter Guides
                </Link>
              </li>
              <li>
                <Link href="/marketplace?tier=growth" className="hover:text-foreground transition-colors">
                  Growth Guides
                </Link>
              </li>
              <li>
                <Link href="/marketplace?tier=enterprise" className="hover:text-foreground transition-colors">
                  Enterprise Guides
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Blueprint Nexus. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Synthesized by the Blueprint Nexus AI-Ops Engine using real-time data.
          </p>
        </div>
      </div>
    </footer>
  );
}
