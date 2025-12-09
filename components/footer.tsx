import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["Scores", "Standings", "Stats", "Schedule"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Teams */}
          <div>
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm mb-4">Teams</h3>
            <ul className="space-y-2">
              {["AL East", "AL Central", "AL West", "NL East", "NL Central", "NL West"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* News */}
          <div>
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm mb-4">News</h3>
            <ul className="space-y-2">
              {["Latest", "Trades", "Injuries", "Rumors"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm mb-4">More</h3>
            <ul className="space-y-2">
              {["Fantasy", "Betting", "Shop", "Tickets"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">⚾</span>
            </div>
            <span className="font-bold text-foreground">MLB CENTRAL</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-right">
            © 2025 MLB Central. All rights reserved. Not affiliated with Major League Baseball.
          </p>
        </div>
      </div>
    </footer>
  )
}
