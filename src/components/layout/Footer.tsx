export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Giới thiệu
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Trợ giúp
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Báo chí
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              API
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Việc làm
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Quyền riêng tư
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Điều khoản
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Vị trí
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Ngôn ngữ
            </a>
            <span>·</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Meta với xác minh
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
