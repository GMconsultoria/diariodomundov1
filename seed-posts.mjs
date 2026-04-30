import mysql from 'mysql2/promise';

// Parse DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  ssl: {},
});

const seedPosts = [
  {
    title: "Novas diretrizes políticas impactam o cenário nacional e internacional",
    slug: "novas-diretrizes-politicas",
    subtitle: "Mudanças significativas nas políticas governamentais afetam economia e relações internacionais",
    content: "<p>As novas diretrizes políticas anunciadas pelo governo promovem mudanças significativas no cenário nacional. Essas medidas têm como objetivo modernizar a administração pública e melhorar a eficiência dos serviços.</p><p>Especialistas apontam que as mudanças podem trazer impactos positivos para a economia, com expectativas de crescimento nos próximos trimestres.</p>",
    category: "Política",
    author: "João Silva",
    imageUrl: "https://via.placeholder.com/800x400?text=Politica",
    published: true,
    views: 1250,
  },
  {
    title: "Mercado financeiro reage positivamente às novas medidas econômicas",
    slug: "mercado-financeiro-reage-positivamente",
    subtitle: "Índices de bolsa de valores apresentam alta após anúncio de medidas econômicas",
    content: "<p>O mercado financeiro respondeu positivamente às novas medidas econômicas anunciadas. Os índices de bolsa de valores apresentaram alta significativa no pregão de hoje.</p><p>Analistas destacam que o mercado aguardava por sinais claros de direcionamento econômico, e as medidas anunciadas correspondem às expectativas do setor.</p>",
    category: "Economia",
    author: "Maria Santos",
    imageUrl: "https://via.placeholder.com/800x400?text=Economia",
    published: true,
    views: 980,
  },
  {
    title: "Oportunidades de investimento em startups de tecnologia crescem 40%",
    slug: "oportunidades-investimento-startups",
    subtitle: "Setor de tecnologia atrai mais investidores e capital nos últimos meses",
    content: "<p>As oportunidades de investimento em startups de tecnologia cresceram 40% nos últimos meses, segundo relatório do setor. O crescimento reflete a confiança dos investidores no potencial inovador das empresas brasileiras.</p><p>Fundos de investimento internacionais aumentaram sua presença no mercado brasileiro, buscando oportunidades em empresas de tecnologia e inovação.</p>",
    category: "Investimentos",
    author: "Carlos Oliveira",
    imageUrl: "https://via.placeholder.com/800x400?text=Investimentos",
    published: true,
    views: 1150,
  },
  {
    title: "Inteligência Artificial revoluciona a medicina moderna",
    slug: "inteligencia-artificial-medicina",
    subtitle: "Novas aplicações de IA estão transformando diagnósticos e tratamentos médicos",
    content: "<p>A inteligência artificial está revolucionando a medicina moderna com novas aplicações em diagnósticos e tratamentos. Hospitais de todo o mundo adotam sistemas de IA para melhorar a precisão dos diagnósticos.</p><p>Pesquisadores apontam que a IA pode reduzir em até 30% o tempo de diagnóstico de doenças complexas, melhorando significativamente os resultados dos tratamentos.</p>",
    category: "Ciência e Tecnologia",
    author: "Dr. Fernando Costa",
    imageUrl: "https://via.placeholder.com/800x400?text=Tecnologia",
    published: true,
    views: 2100,
  },
  {
    title: "Descoberta de nova espécie de animal surpreende cientistas",
    slug: "descoberta-nova-especie-animal",
    subtitle: "Cientistas descobrem espécie desconhecida em floresta tropical",
    content: "<p>Uma equipe de cientistas descobriu uma nova espécie de animal em uma floresta tropical. A descoberta adiciona mais uma espécie à lista de biodiversidade do planeta.</p><p>O animal, ainda sem nome científico oficial, apresenta características únicas que intrigam a comunidade científica e abre novas possibilidades de pesquisa.</p>",
    category: "Curiosidade",
    author: "Dra. Beatriz Lima",
    imageUrl: "https://via.placeholder.com/800x400?text=Curiosidade",
    published: true,
    views: 850,
  },
  {
    title: "Reforma tributária: entenda as principais mudanças",
    slug: "reforma-tributaria-mudancas",
    subtitle: "Governo apresenta novo modelo de tributação que afeta empresas e consumidores",
    content: "<p>A reforma tributária apresentada pelo governo traz mudanças significativas no sistema de impostos. As alterações afetam tanto empresas quanto consumidores finais.</p><p>Especialistas em tributação analisam os impactos das mudanças e orientam empresas sobre como se adaptar ao novo modelo.</p>",
    category: "Economia",
    author: "Prof. Ricardo Mendes",
    imageUrl: "https://via.placeholder.com/800x400?text=Tributacao",
    published: true,
    views: 1450,
  },
  {
    title: "Criptomoedas ganham espaço no portfólio de investidores brasileiros",
    slug: "criptomoedas-investidores-brasileiros",
    subtitle: "Mais brasileiros adotam criptomoedas como forma de investimento",
    content: "<p>As criptomoedas ganham cada vez mais espaço no portfólio de investidores brasileiros. Pesquisas mostram que o número de investidores em criptomoedas cresceu 50% no último ano.</p><p>Reguladores discutem novas regras para o mercado de criptomoedas, buscando proteger investidores e evitar fraudes.</p>",
    category: "Investimentos",
    author: "Ana Pereira",
    imageUrl: "https://via.placeholder.com/800x400?text=Criptomoedas",
    published: true,
    views: 1600,
  },
  {
    title: "Computação quântica: o futuro da tecnologia está aqui",
    slug: "computacao-quantica-futuro",
    subtitle: "Avanços em computação quântica prometem revolucionar a tecnologia",
    content: "<p>A computação quântica está saindo do laboratório e entrando na realidade. Empresas de tecnologia investem bilhões em pesquisa e desenvolvimento de computadores quânticos.</p><p>Especialistas acreditam que a computação quântica pode resolver problemas que os computadores tradicionais levam séculos para processar.</p>",
    category: "Ciência e Tecnologia",
    author: "Prof. Marcos Gomes",
    imageUrl: "https://via.placeholder.com/800x400?text=Quantum",
    published: true,
    views: 1900,
  },
  {
    title: "Fenômeno natural raro observado por astrônomos",
    slug: "fenomeno-natural-raro-astronomos",
    subtitle: "Astrônomos observam evento celestial que ocorre uma vez a cada século",
    content: "<p>Astrônomos ao redor do mundo observaram um fenômeno natural raro que ocorre apenas uma vez a cada século. O evento foi capturado por telescópios de última geração.</p><p>A observação fornece dados valiosos para entender melhor o universo e os processos que ocorrem no espaço.</p>",
    category: "Curiosidade",
    author: "Dr. Henrique Alves",
    imageUrl: "https://via.placeholder.com/800x400?text=Astronomia",
    published: true,
    views: 1100,
  },
  {
    title: "Política externa: Brasil fortalece relações diplomáticas",
    slug: "brasil-fortalece-relacoes-diplomaticas",
    subtitle: "Novo acordo diplomático entre Brasil e países europeus",
    content: "<p>O Brasil assinou novo acordo diplomático com países europeus, fortalecendo as relações internacionais. O acordo abrange áreas de comércio, tecnologia e educação.</p><p>Autoridades brasileiras destacam a importância do acordo para o desenvolvimento econômico e cultural do país.</p>",
    category: "Política",
    author: "Embaixador José Martins",
    imageUrl: "https://via.placeholder.com/800x400?text=Diplomacia",
    published: true,
    views: 750,
  },
];

try {
  console.log('Inserindo notícias de teste...');
  
  for (const post of seedPosts) {
    const publishedAt = new Date();
    
    await connection.execute(
      `INSERT INTO posts (title, slug, subtitle, content, category, author, imageUrl, published, views, createdAt, updatedAt, publishedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [post.title, post.slug, post.subtitle, post.content, post.category, post.author, post.imageUrl, post.published ? 1 : 0, post.views, publishedAt]
    );
    console.log(`✓ Inserido: ${post.title}`);
  }
  
  console.log('\n✓ Todas as notícias foram inseridas com sucesso!');
} catch (error) {
  console.error('Erro ao inserir notícias:', error.message);
} finally {
  await connection.end();
}
