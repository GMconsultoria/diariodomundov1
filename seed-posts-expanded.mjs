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

const additionalPosts = [
  {
    title: "Economia brasileira cresce 2.5% no primeiro trimestre",
    slug: "economia-brasileira-cresce-2-5",
    subtitle: "PIB apresenta crescimento acima das expectativas dos analistas",
    content: "<p>A economia brasileira cresceu 2.5% no primeiro trimestre de 2026, superando as expectativas dos analistas que previam crescimento de 1.8%.</p><p>O crescimento foi impulsionado principalmente pelo setor de serviços e pela recuperação da indústria de transformação.</p>",
    category: "Economia",
    author: "Analista Econômico",
    imageUrl: "https://via.placeholder.com/800x400?text=Economia+Brasil",
    published: true,
    views: 2300,
  },
  {
    title: "Fundos de investimento em ações crescem 35% em 2026",
    slug: "fundos-investimento-acoes-crescem",
    subtitle: "Investidores brasileiros aumentam alocação em renda variável",
    content: "<p>Os fundos de investimento em ações cresceram 35% em 2026, refletindo maior confiança dos investidores no mercado.</p><p>Especialistas apontam que a recuperação econômica e as perspectivas positivas para o setor impulsionam esse crescimento.</p>",
    category: "Investimentos",
    author: "Gestor de Fundos",
    imageUrl: "https://via.placeholder.com/800x400?text=Fundos+Investimento",
    published: true,
    views: 1850,
  },
  {
    title: "Tecnologia blockchain revoluciona sistemas financeiros",
    slug: "blockchain-revoluciona-financeiro",
    subtitle: "Bancos adotam tecnologia para melhorar segurança e eficiência",
    content: "<p>A tecnologia blockchain está revolucionando os sistemas financeiros, com bancos adotando a tecnologia para melhorar segurança e eficiência.</p><p>A descentralização e a imutabilidade dos registros tornam a tecnologia ideal para transações financeiras.</p>",
    category: "Ciência e Tecnologia",
    author: "Especialista em Blockchain",
    imageUrl: "https://via.placeholder.com/800x400?text=Blockchain",
    published: true,
    views: 2150,
  },
  {
    title: "Reforma tributária aprovada no Congresso Nacional",
    slug: "reforma-tributaria-aprovada",
    subtitle: "Novo sistema de impostos entra em vigor em 2027",
    content: "<p>O Congresso Nacional aprovou a reforma tributária que moderniza o sistema de impostos brasileiro.</p><p>A nova legislação entra em vigor em 2027 e promete simplificar a tributação e reduzir a burocracia para empresas e consumidores.</p>",
    category: "Política",
    author: "Correspondente Político",
    imageUrl: "https://via.placeholder.com/800x400?text=Reforma+Tributaria",
    published: true,
    views: 1600,
  },
  {
    title: "Descoberta de novo mineral com propriedades únicas",
    slug: "descoberta-novo-mineral",
    subtitle: "Cientistas encontram mineral que pode revolucionar a tecnologia",
    content: "<p>Cientistas descobriram um novo mineral com propriedades únicas que pode revolucionar a tecnologia de semicondutores.</p><p>O mineral, encontrado em depósitos no Brasil, apresenta características que superam os materiais atualmente utilizados.</p>",
    category: "Curiosidade",
    author: "Pesquisador Científico",
    imageUrl: "https://via.placeholder.com/800x400?text=Mineral+Novo",
    published: true,
    views: 1400,
  },
  {
    title: "Inteligência Artificial cria novas oportunidades de negócios",
    slug: "ia-oportunidades-negocios",
    subtitle: "Startups utilizam IA para resolver problemas complexos",
    content: "<p>A inteligência artificial está criando novas oportunidades de negócios, com startups utilizando a tecnologia para resolver problemas complexos.</p><p>Investidores aumentam aportes em empresas de IA, reconhecendo o potencial transformador da tecnologia.</p>",
    category: "Investimentos",
    author: "Analista de Startups",
    imageUrl: "https://via.placeholder.com/800x400?text=IA+Negocios",
    published: true,
    views: 2000,
  },
  {
    title: "Acordo comercial entre Brasil e União Europeia",
    slug: "acordo-comercial-brasil-ue",
    subtitle: "Novo tratado abre mercados para produtos brasileiros",
    content: "<p>Brasil e União Europeia assinaram novo acordo comercial que abre mercados para produtos brasileiros.</p><p>O acordo inclui redução de tarifas para produtos agrícolas e industrializados, beneficiando exportadores brasileiros.</p>",
    category: "Política",
    author: "Correspondente Internacional",
    imageUrl: "https://via.placeholder.com/800x400?text=Acordo+Comercial",
    published: true,
    views: 1350,
  },
  {
    title: "Mercado de energia renovável cresce 50% no Brasil",
    slug: "energia-renovavel-cresce-50",
    subtitle: "Investimentos em energia solar e eólica aumentam significativamente",
    content: "<p>O mercado de energia renovável cresceu 50% no Brasil, com investimentos em energia solar e eólica aumentando significativamente.</p><p>Empresas de energia renovável atraem investidores internacionais interessados em sustentabilidade.</p>",
    category: "Economia",
    author: "Analista de Energia",
    imageUrl: "https://via.placeholder.com/800x400?text=Energia+Renovavel",
    published: true,
    views: 1900,
  },
  {
    title: "Fenômeno climático extremo afeta regiões do Brasil",
    slug: "fenomeno-climatico-extremo",
    subtitle: "Cientistas estudam impactos das mudanças climáticas",
    content: "<p>Um fenômeno climático extremo afetou regiões do Brasil, causando danos significativos à infraestrutura.</p><p>Cientistas estudam os impactos das mudanças climáticas e desenvolvem estratégias de adaptação.</p>",
    category: "Curiosidade",
    author: "Climatologista",
    imageUrl: "https://via.placeholder.com/800x400?text=Clima+Extremo",
    published: true,
    views: 1700,
  },
  {
    title: "Computadores quânticos alcançam novo marco de processamento",
    slug: "computadores-quanticos-marco",
    subtitle: "Processadores quânticos resolvem problema complexo em minutos",
    content: "<p>Computadores quânticos alcançaram novo marco ao resolver um problema complexo em minutos, algo que levaria séculos para computadores tradicionais.</p><p>O avanço abre novas possibilidades para pesquisa científica e desenvolvimento tecnológico.</p>",
    category: "Ciência e Tecnologia",
    author: "Pesquisador Quântico",
    imageUrl: "https://via.placeholder.com/800x400?text=Quantum+Computing",
    published: true,
    views: 2200,
  },
  {
    title: "Investimento em startups de saúde digital cresce 60%",
    slug: "startups-saude-digital-crescem",
    subtitle: "Telemedicina e apps de saúde atraem capital de risco",
    content: "<p>O investimento em startups de saúde digital cresceu 60%, com telemedicina e aplicativos de saúde atraindo capital de risco.</p><p>Empresas de saúde digital oferecem soluções inovadoras para acesso à saúde e bem-estar.</p>",
    category: "Investimentos",
    author: "Analista de Saúde",
    imageUrl: "https://via.placeholder.com/800x400?text=Saude+Digital",
    published: true,
    views: 1750,
  },
  {
    title: "Eleições municipais marcadas para outubro de 2026",
    slug: "eleicoes-municipais-2026",
    subtitle: "Campanhas políticas começam a se organizar",
    content: "<p>As eleições municipais foram marcadas para outubro de 2026, com campanhas políticas começando a se organizar.</p><p>Analistas apontam que as eleições serão decisivas para o futuro político do país.</p>",
    category: "Política",
    author: "Analista Político",
    imageUrl: "https://via.placeholder.com/800x400?text=Eleicoes+2026",
    published: true,
    views: 1500,
  },
  {
    title: "Espécie de pássaro raro observada em mata atlântica",
    slug: "passaro-raro-mata-atlantica",
    subtitle: "Ornitólogos registram avistamento de espécie em perigo de extinção",
    content: "<p>Ornitólogos registraram o avistamento de uma espécie rara de pássaro na Mata Atlântica, uma espécie em perigo de extinção.</p><p>O avistamento oferece esperança para conservacionistas que trabalham para proteger a biodiversidade.</p>",
    category: "Curiosidade",
    author: "Ornitólogo",
    imageUrl: "https://via.placeholder.com/800x400?text=Passaro+Raro",
    published: true,
    views: 1200,
  },
  {
    title: "Startups de tecnologia recebem investimento recorde",
    slug: "startups-tech-investimento-recorde",
    subtitle: "Venture capital investe bilhões em empresas de tecnologia",
    content: "<p>Startups de tecnologia receberam investimento recorde, com venture capital investindo bilhões em empresas inovadoras.</p><p>O Brasil se consolida como hub de tecnologia na América Latina, atraindo investidores globais.</p>",
    category: "Investimentos",
    author: "Jornalista de Tecnologia",
    imageUrl: "https://via.placeholder.com/800x400?text=Startups+Tech",
    published: true,
    views: 2100,
  },
  {
    title: "Vacina contra nova variante de doença é desenvolvida",
    slug: "vacina-nova-variante",
    subtitle: "Pesquisadores desenvolvem vacina eficaz em tempo recorde",
    content: "<p>Pesquisadores desenvolveram uma vacina contra nova variante de doença em tempo recorde, demonstrando avanço na medicina.</p><p>A vacina será distribuída globalmente para proteger populações contra a doença.</p>",
    category: "Ciência e Tecnologia",
    author: "Pesquisador Médico",
    imageUrl: "https://via.placeholder.com/800x400?text=Vacina+Desenvolvimento",
    published: true,
    views: 1950,
  },
];

try {
  console.log('Inserindo notícias adicionais de teste...');
  
  for (const post of additionalPosts) {
    const publishedAt = new Date();
    
    await connection.execute(
      `INSERT INTO posts (title, slug, subtitle, content, category, author, imageUrl, published, views, createdAt, updatedAt, publishedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [post.title, post.slug, post.subtitle, post.content, post.category, post.author, post.imageUrl, post.published ? 1 : 0, post.views, publishedAt]
    );
    console.log(`✓ Inserido: ${post.title}`);
  }
  
  console.log('\n✓ Todas as notícias adicionais foram inseridas com sucesso!');
} catch (error) {
  console.error('Erro ao inserir notícias:', error.message);
} finally {
  await connection.end();
}
