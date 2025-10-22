// components/AnimatedScene.jsx
import Moldura from "../assets/moldura.svg";
import Montanha from "../assets/montanha.svg";
import Nuvem_inf from "../assets/nuvem_inf.svg";
import Nuvem_sup from "../assets/nuvem_sup.svg";
import Sol from "../assets/sol.svg";
import Vento_sup_dir from "../assets/vento_sup_dir.svg";
import Vento_inf from "../assets/vento_inf.svg";
import Vento_sup_esq from "../assets/vento_sup_esq.svg";

export default function AnimatedScene() {
  return (
    <div className="scene-wrapper">
      <div className="svg-container">
        <svg
        viewBox="0 0 1000 1000"
        width="100%"
        height="100vh"
        className="scene"
        xmlns="http://www.w3.org/2000/svg"
        >
        {/* pinta o ViewBox   
        <rect width="100%" height="100%" fill="rgba(151, 151, 245, 0.1)" /> */}
        

        {/* moldura em forma de diamante */}
        <Moldura id="diamond" className="moldura" />

        {/* montanha */}
        <Montanha id="mountain" className="montanha" />

        {/* Nuvem inferior */}
        <Nuvem_inf id="cloud_inf" className="nuvem_inf" />

        {/* Nuvem superior */}
        <Nuvem_sup id="cloud_sup" className="nuvem_sup" />

        {/* Sol */}
        <Sol id="sun" className="sol" />

        {/* ventos — linhas onduladas */}
          <Vento_sup_dir id="wind_sup_dir" className="vento_sup_dir" />
          <Vento_sup_esq id="wind_sup_esq" className="vento_sup_esq" />
          <Vento_inf     id="wind_inf"     className="vento_inf" />                  

        </svg>
      </div>

      <style jsx>{`

        .scene-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
        }

        .svg-container {
          width: 100%;            /* quase toda largura em celular */
          max-width: 600px;      /* limite de largura razoável */ 
        }

        .scene {
          width: 100%;
          height: auto;
        }

        @media (min-width: 1024px) {
          .scene-wrapper {
            flex-direction: row;  /* lado a lado em desktop */
            justify-content: center;
            align-items: flex-start;
          }

          .svg-container {
            width: 30%;          /* ocupa metade da largura */
            max-width: none;
          }
        }        


        /* animação da moldura */
        :global(#diamond) {
          transform: translate(175px, 10px) scale(1);
          opacity: 0;
          animation: fadeInDiamond 1s 0.5s forwards;
          }
        @keyframes fadeInDiamond {
          to {
            opacity: 1;
          }
        }

        /* animação da montanha */
        :global(#mountain) {
            transform: translate(335px, 345px);
          opacity: 0;
          animation: riseMountain 1s 0.5s forwards;
        }
        @keyframes riseMountain {
          to {
            transform: translate(235px, 245px);
            opacity: 0.3;
          }
        }

        /* nuvem baixa — entra da direita para a esquerda */
        :global(#cloud_inf) {

          opacity: 0;
          transform: translate(615px, 462px) scale(0.75);
          animation: enterCloudLow 1s 1.5s forwards,
          floatLow 6s 4.5s infinite alternate ease-in-out;
        }
        @keyframes enterCloudLow {
          to {
            transform: translate(515px, 462px)  scale(0.75);
            opacity: 1;
          }
        }
        @keyframes floatLow {
          0% {
            transform: translate(515px, 462px) scale(0.75);
          }
          50% {
            transform: translate(535px, 470px) scale(0.75);
          }
          100% {
            transform: translate(515px, 462px) scale(0.75);
          }
        }

        /* nuvem alta — entra da esquerda para a direita */
        :global(#cloud_sup) {
          opacity: 0;
          transform: translate(-55px, 80px) scale(0.7);
          animation: enterCloudHigh 1s 1.5s forwards,
            floatHigh 8s 4.5s infinite alternate ease-in-out;
        }
        @keyframes enterCloudHigh {
          to {
            transform: translate(45px, 80px) scale(0.7);
            opacity: 1;
          }
        }
        @keyframes floatHigh {
          0% {
            transform: translate(45px, 80px) scale(0.7);
          }
          50% {
            transform: translate(55px, 95px) scale(0.7);
          }
          100% {
            transform: translate(45px, 80px) scale(0.7);
          }
        }

        /* sol sobe de trás da montanha */
        :global(#sun) {
          transform: translate(355px, 220px) scale(0.6);
          opacity: 0;
          animation: riseSun 1s 1.5s forwards;
        }
        @keyframes riseSun {
          to {
            transform: translate(355px, 120px) scale(0.7);
            opacity: 0.1;
          }
        }

        /* vento alta direito */
        :global(#wind_sup_dir) {
          opacity: 0;
          transform: translate(600px, 220px) scale(0.9);
          animation: enterWindHighRight 1s 1.5s forwards,
            WindfloatHigh 8s 4.5s infinite alternate ease-in-out;
        }
        @keyframes enterWindHighRight {
          to {
            transform: translate(550px, 220px) scale(0.9);
            opacity: 1;
          }
        }
        @keyframes WindfloatHigh {
          0% {
            transform: translate(550px, 220px) scale(0.9);
          }
          50% {
            transform: translate(565px, 225px) scale(0.9);
          }
          100% {
            transform: translate(550px, 220px) scale(0.9);
          }
        }

        /* vento alta esquerdo */
        :global(#wind_sup_esq) {
          opacity: 0;
          transform: translate(00px, 340px) scale(0.8);
          animation: enterWindHighLeft 1s 1.5s forwards,
            WindfloatHighL 8s 4.5s infinite alternate ease-in-out;
        }
        @keyframes enterWindHighLeft {
          to {
            transform: translate(50px, 340px) scale(0.8);
            opacity: 1;
          }
        }
        @keyframes WindfloatHighL {
          0% {
            transform: translate(50px, 340px) scale(0.8);
          }
          50% {
            transform: translate(65px, 335px) scale(0.8);
          }
          100% {
            transform: translate(50px, 340px) scale(0.8);
          }
        }        

        /* vento inferior */
        :global(#wind_inf) {
          opacity: 0;
          transform: translate(00px, 640px) scale(0.8);
          animation: enterWindLow 1s 1.5s forwards,
            WindfloatLow 8s 4.5s infinite alternate ease-in-out;
        }
        @keyframes enterWindLow {
          to {
            transform: translate(95px, 640px) scale(0.8);
            opacity: 1;
          }
        }
        @keyframes WindfloatLow {
          0% {
            transform: translate(95px, 640px) scale(0.8);
          }
          50% {
            transform: translate(100px, 645px) scale(0.8);
          }
          100% {
            transform: translate(95px, 640px) scale(0.8);
          }
        }    


`}</style>
    </div>

  );
}