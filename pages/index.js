import { useEffect, useState } from "react";
import AnimatedScene from "../components/AnimatedScene";
import Contador from "../components/Contador";

export default function Home() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = dark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setDark(!dark);
    try {
      localStorage.setItem("theme", nextTheme);
    } catch (_) {
      // Storage may be blocked; the toggle still works for this visit.
    }
  }

  const estiloContainer = {
    backgroundColor: "var(--page-background)",
    minHeight: "100vh",          // para ocupar toda a altura da tela
    margin: 0,
    padding: 0,
  };

  return (
    <div style={estiloContainer}>
      <button
        className="theme-toggle"
        type="button"
        aria-label="Modo escuro"
        aria-pressed={dark}
        onClick={toggleTheme}
      >
        Modo escuro
      </button>
      <AnimatedScene />
          <center><h2>Lindeza</h2>
          <h3>Vc é minha brisa e ventania,<br/>
              Nunca deixe seu<br/>
              brilho se apagar.
            </h3>
            <h2 style={{ color: "red" }}>Te amo de montão!</h2>
            <h4 className="titulo-pequeno">Feliz <Contador /></h4>
            <h6 className="subtitulo">Pq todo segundo com vc é momento de comemoração.</h6>
            </center>
    </div>
  );
}