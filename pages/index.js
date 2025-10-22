import AnimatedScene from "../components/AnimatedScene";
import Contador from "../components/Contador";

export default function Home() {
  const estiloContainer = {
    backgroundColor: "#ECFDF5",  // por exemplo: um cinza azulado
    minHeight: "100vh",          // para ocupar toda a altura da tela
    margin: 0,
    padding: 0,
  };

  return (
    <div style={estiloContainer}>
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