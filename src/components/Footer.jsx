import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-theme-surface text-theme-primary border-t border-theme py-6 mt-16 sm:mt-24 text-center text-xs sm:text-sm shadow-inner">
      <div className="container mx-auto px-4 max-w-3xl space-y-2">
        <p className="font-display font-medium text-theme-secondary">
          &copy; {currentYear}{" "}
          <span className="font-bold text-theme-primary">PokéSuite</span> · Created by{" "}
          <a
            href="https://github.com/VatsalRaj481"
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-accent hover:underline font-semibold"
          >
            Casy
          </a>
        </p>
        <p className="text-[11px] sm:text-xs text-theme-muted leading-relaxed">
          PokéSuite is a non-commercial, open-source fan project built for educational and competitive community purposes. 
          Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., and Game Freak. 
          This project is not affiliated with or endorsed by Nintendo or The Pokémon Company.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
