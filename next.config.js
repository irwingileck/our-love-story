module.exports = {
  webpack(config) {
    // achar a regra que lida com arquivos svg / loader padrão
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test && rule.test.test && rule.test.test(".svg")
    );

    // adicionar regras para SVG como componente
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // se importado com “?url”, vai usar o loader original
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
        use: ["@svgr/webpack"],
      }
    );

    // excluir SVG da regra de fileLoader para não duplicar
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};