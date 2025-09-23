export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              About
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Help
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Press
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              API
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Jobs
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Location
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Language
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Meta Verified
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground pt-2">
            <p>&copy; 2025 SOCIALMINI FROM S4N6</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
