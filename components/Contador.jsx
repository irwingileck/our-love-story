import { useEffect, useState } from 'react';

export default function Contador() {
  const [tempo, setTempo] = useState('0 anos, 0 meses, 0 dias, 0h 0m 0s');

  useEffect(() => {
    const inicio = new Date("2022-10-20T22:16:00");

    function atualizar() {
      const agora = new Date();

      let anos = agora.getFullYear() - inicio.getFullYear();
      let meses = agora.getMonth() - inicio.getMonth();
      let dias = agora.getDate() - inicio.getDate();
      let horas = agora.getHours() - inicio.getHours();
      let minutos = agora.getMinutes() - inicio.getMinutes();
      let segundos = agora.getSeconds() - inicio.getSeconds();

      // Ajustes se valores ficaram negativos
      if (segundos < 0) {
        segundos += 60;
        minutos--;
      }
      if (minutos < 0) {
        minutos += 60;
        horas--;
      }
      if (horas < 0) {
        horas += 24;
        dias--;
      }
      if (dias < 0) {
        // número de dias no mês anterior
        const mesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0).getDate();
        dias += mesAnterior;
        meses--;
      }
      if (meses < 0) {
        meses += 12;
        anos--;
      }

      setTempo(`${anos} anos, ${meses} meses, ${dias} dias, ${horas}h ${minutos}m ${segundos}s`);
    }

    atualizar();
    const intervalo = setInterval(atualizar, 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div>{tempo}</div>
  );
}