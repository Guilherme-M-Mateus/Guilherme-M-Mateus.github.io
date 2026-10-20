// Translates the page to the browser's language. The HTML is the English source; each table maps
// an exact English text (trimmed) to its translation. Untranslated text stays in English.
(() => {
  const T = {
    pt: {
      'Home': 'Início', 'Competencies': 'Competências', 'Experience': 'Experiência', 'Projects': 'Projetos', 'Contact': 'Contacto', 'Main': 'Principal',
      'Portfolio': 'Portefólio',
      'IT student at ESCO · CCNA certified · Networking, IT support & software development. Lourinhã, Portugal.': 'Estudante de informática na ESCO · Certificado CCNA · Redes, suporte informático e desenvolvimento de software. Lourinhã, Portugal.',
      'About': 'Sobre mim',
      "My name is Guilherme Mateus. I've been using computers since I was nine years old. I study at": 'Chamo-me Guilherme Mateus. Uso computadores desde os nove anos. Estudo na',
      'and have interned at': 'e estagiei na',
      '. I have experience working with real systems, as well as more conceptual technology.': '. Tenho experiência a trabalhar com sistemas reais, assim como com tecnologia mais conceptual.',
      'Where to next': 'Explorar', 'What I work with.': 'Com o que trabalho.', "Where I've done it.": 'Onde o fiz.', "What I've built.": 'O que construí.', 'Say hi.': 'Diz olá.',
      'The tools and skills I use day to day.': 'As ferramentas e competências que uso no dia a dia.',
      'Networking': 'Redes', 'Cisco certified': 'Certificado Cisco', 'IT': 'Informática', 'IT hardware support': 'Suporte de hardware', 'Information technology': 'Tecnologias de informação',
      'Languages': 'Línguas', 'Fluent English': 'Inglês fluente', 'Fluent Portuguese': 'Português fluente',
      'How I work': 'Como trabalho',
      "I'm always open to opportunities to learn, contribute and grow, and keep building on networking and software development.": 'Estou sempre aberto a oportunidades para aprender, contribuir e crescer, e continuo a aprofundar os meus conhecimentos em redes e desenvolvimento de software.',
      'Selected work and studies.': 'Trabalho e estudos.',
      'May 2026 — Jul 2026 · Torres Vedras, Portugal': 'mai 2026 — jul 2026 · Torres Vedras, Portugal',
      'IT Intern · blueOASIS': 'Estagiário de Informática · blueOASIS',
      'Hands-on experience with real systems and internal tools, building practical IT and software skills.': 'Experiência prática com sistemas reais e ferramentas internas, desenvolvendo competências de informática e software.',
      'Present · Oeste, Portugal': 'Atual · Oeste, Portugal',
      'IT Student · ESCO – Escola de Serviços e Comércio do Oeste': 'Estudante de Informática · ESCO – Escola de Serviços e Comércio do Oeste',
      'Networking, IT support and software development.': 'Redes, suporte informático e desenvolvimento de software.',
      'Certifications': 'Certificações', 'Issued Jul 2026': 'Emitido em jul 2026',
      'Public repositories on GitHub.': 'Repositórios públicos no GitHub.', 'Contributions': 'Contribuições', 'No public projects yet.': 'Ainda não há projetos públicos.',
      'Phone': 'Telefone', 'Send a message': 'Enviar mensagem', 'Name': 'Nome', 'Message': 'Mensagem', 'Send': 'Enviar',
    },
    es: {
      'Home': 'Inicio', 'Competencies': 'Competencias', 'Experience': 'Experiencia', 'Projects': 'Proyectos', 'Contact': 'Contacto', 'Main': 'Principal',
      'Portfolio': 'Portafolio',
      'IT student at ESCO · CCNA certified · Networking, IT support & software development. Lourinhã, Portugal.': 'Estudiante de informática en ESCO · Certificado CCNA · Redes, soporte informático y desarrollo de software. Lourinhã, Portugal.',
      'About': 'Sobre mí',
      "My name is Guilherme Mateus. I've been using computers since I was nine years old. I study at": 'Me llamo Guilherme Mateus. Uso ordenadores desde los nueve años. Estudio en',
      'and have interned at': 'e hice prácticas en',
      '. I have experience working with real systems, as well as more conceptual technology.': '. Tengo experiencia trabajando con sistemas reales, así como con tecnología más conceptual.',
      'Where to next': 'Explorar', 'What I work with.': 'Con qué trabajo.', "Where I've done it.": 'Dónde lo he hecho.', "What I've built.": 'Lo que he construido.', 'Say hi.': 'Saluda.',
      'The tools and skills I use day to day.': 'Las herramientas y habilidades que uso a diario.',
      'Networking': 'Redes', 'Cisco certified': 'Certificado Cisco', 'IT': 'Informática', 'IT hardware support': 'Soporte de hardware', 'Information technology': 'Tecnologías de la información',
      'Languages': 'Idiomas', 'Fluent English': 'Inglés fluido', 'Fluent Portuguese': 'Portugués fluido',
      'How I work': 'Cómo trabajo',
      "I'm always open to opportunities to learn, contribute and grow, and keep building on networking and software development.": 'Siempre estoy abierto a oportunidades para aprender, contribuir y crecer, y sigo profundizando en redes y desarrollo de software.',
      'Selected work and studies.': 'Trabajo y estudios.',
      'May 2026 — Jul 2026 · Torres Vedras, Portugal': 'may 2026 — jul 2026 · Torres Vedras, Portugal',
      'IT Intern · blueOASIS': 'Becario de Informática · blueOASIS',
      'Hands-on experience with real systems and internal tools, building practical IT and software skills.': 'Experiencia práctica con sistemas reales y herramientas internas, desarrollando habilidades de informática y software.',
      'Present · Oeste, Portugal': 'Actualidad · Oeste, Portugal',
      'IT Student · ESCO – Escola de Serviços e Comércio do Oeste': 'Estudiante de Informática · ESCO – Escola de Serviços e Comércio do Oeste',
      'Networking, IT support and software development.': 'Redes, soporte informático y desarrollo de software.',
      'Certifications': 'Certificaciones', 'Issued Jul 2026': 'Emitido en jul 2026',
      'Public repositories on GitHub.': 'Repositorios públicos en GitHub.', 'Contributions': 'Contribuciones', 'No public projects yet.': 'Todavía no hay proyectos públicos.',
      'Email': 'Correo', 'Phone': 'Teléfono', 'Send a message': 'Enviar un mensaje', 'Name': 'Nombre', 'Message': 'Mensaje', 'Send': 'Enviar',
    },
    fr: {
      'Home': 'Accueil', 'Competencies': 'Compétences', 'Experience': 'Expérience', 'Projects': 'Projets', 'Contact': 'Contact', 'Main': 'Principal',
      'Portfolio': 'Portfolio',
      'IT student at ESCO · CCNA certified · Networking, IT support & software development. Lourinhã, Portugal.': 'Étudiant en informatique à l’ESCO · Certifié CCNA · Réseaux, support informatique et développement logiciel. Lourinhã, Portugal.',
      'About': 'À propos',
      "My name is Guilherme Mateus. I've been using computers since I was nine years old. I study at": 'Je m’appelle Guilherme Mateus. J’utilise des ordinateurs depuis l’âge de neuf ans. J’étudie à',
      'and have interned at': 'et j’ai fait un stage chez',
      '. I have experience working with real systems, as well as more conceptual technology.': '. J’ai de l’expérience avec des systèmes réels, ainsi qu’avec des technologies plus conceptuelles.',
      'Where to next': 'Explorer', 'What I work with.': 'Avec quoi je travaille.', "Where I've done it.": 'Où je l’ai fait.', "What I've built.": 'Ce que j’ai construit.', 'Say hi.': 'Dites bonjour.',
      'The tools and skills I use day to day.': 'Les outils et compétences que j’utilise au quotidien.',
      'Networking': 'Réseaux', 'Cisco certified': 'Certifié Cisco', 'IT': 'Informatique', 'IT hardware support': 'Support matériel', 'Information technology': 'Technologies de l’information',
      'Languages': 'Langues', 'Fluent English': 'Anglais courant', 'Fluent Portuguese': 'Portugais courant',
      'How I work': 'Ma façon de travailler',
      "I'm always open to opportunities to learn, contribute and grow, and keep building on networking and software development.": 'Je suis toujours ouvert aux occasions d’apprendre, de contribuer et de progresser, et je continue à approfondir les réseaux et le développement logiciel.',
      'Selected work and studies.': 'Travail et études.',
      'May 2026 — Jul 2026 · Torres Vedras, Portugal': 'mai 2026 — juil. 2026 · Torres Vedras, Portugal',
      'IT Intern · blueOASIS': 'Stagiaire en informatique · blueOASIS',
      'Hands-on experience with real systems and internal tools, building practical IT and software skills.': 'Expérience pratique avec des systèmes réels et des outils internes, développant des compétences en informatique et en logiciel.',
      'Present · Oeste, Portugal': 'Actuellement · Oeste, Portugal',
      'IT Student · ESCO – Escola de Serviços e Comércio do Oeste': 'Étudiant en informatique · ESCO – Escola de Serviços e Comércio do Oeste',
      'Networking, IT support and software development.': 'Réseaux, support informatique et développement logiciel.',
      'Certifications': 'Certifications', 'Issued Jul 2026': 'Délivré en juil. 2026',
      'Public repositories on GitHub.': 'Dépôts publics sur GitHub.', 'Contributions': 'Contributions', 'No public projects yet.': 'Pas encore de projets publics.',
      'Email': 'E-mail', 'Phone': 'Téléphone', 'Send a message': 'Envoyer un message', 'Name': 'Nom', 'Message': 'Message', 'Send': 'Envoyer',
    },
    de: {
      'Home': 'Start', 'Competencies': 'Kompetenzen', 'Experience': 'Erfahrung', 'Projects': 'Projekte', 'Contact': 'Kontakt', 'Main': 'Hauptmenü',
      'Portfolio': 'Portfolio',
      'IT student at ESCO · CCNA certified · Networking, IT support & software development. Lourinhã, Portugal.': 'IT-Schüler an der ESCO · CCNA-zertifiziert · Netzwerke, IT-Support & Softwareentwicklung. Lourinhã, Portugal.',
      'About': 'Über mich',
      "My name is Guilherme Mateus. I've been using computers since I was nine years old. I study at": 'Ich heiße Guilherme Mateus. Ich benutze Computer, seit ich neun Jahre alt bin. Ich lerne an der',
      'and have interned at': 'und habe ein Praktikum gemacht bei',
      '. I have experience working with real systems, as well as more conceptual technology.': '. Ich habe Erfahrung mit echten Systemen sowie mit eher konzeptioneller Technologie.',
      'Where to next': 'Weiter', 'What I work with.': 'Womit ich arbeite.', "Where I've done it.": 'Wo ich es gemacht habe.', "What I've built.": 'Was ich gebaut habe.', 'Say hi.': 'Sag hallo.',
      'The tools and skills I use day to day.': 'Die Werkzeuge und Fähigkeiten, die ich täglich nutze.',
      'Networking': 'Netzwerke', 'Cisco certified': 'Cisco-zertifiziert', 'IT': 'IT', 'IT hardware support': 'Hardware-Support', 'Information technology': 'Informationstechnik',
      'Languages': 'Sprachen', 'Fluent English': 'Fließend Englisch', 'Fluent Portuguese': 'Fließend Portugiesisch',
      'How I work': 'Wie ich arbeite',
      "I'm always open to opportunities to learn, contribute and grow, and keep building on networking and software development.": 'Ich bin immer offen für Gelegenheiten zu lernen, beizutragen und zu wachsen, und baue mein Wissen in Netzwerken und Softwareentwicklung weiter aus.',
      'Selected work and studies.': 'Arbeit und Ausbildung.',
      'May 2026 — Jul 2026 · Torres Vedras, Portugal': 'Mai 2026 — Juli 2026 · Torres Vedras, Portugal',
      'IT Intern · blueOASIS': 'IT-Praktikant · blueOASIS',
      'Hands-on experience with real systems and internal tools, building practical IT and software skills.': 'Praktische Erfahrung mit echten Systemen und internen Tools, Aufbau von IT- und Softwarekenntnissen.',
      'Present · Oeste, Portugal': 'Aktuell · Oeste, Portugal',
      'IT Student · ESCO – Escola de Serviços e Comércio do Oeste': 'IT-Schüler · ESCO – Escola de Serviços e Comércio do Oeste',
      'Networking, IT support and software development.': 'Netzwerke, IT-Support und Softwareentwicklung.',
      'Certifications': 'Zertifikate', 'Issued Jul 2026': 'Ausgestellt Juli 2026',
      'Public repositories on GitHub.': 'Öffentliche Repositories auf GitHub.', 'Contributions': 'Beiträge', 'No public projects yet.': 'Noch keine öffentlichen Projekte.',
      'Email': 'E-Mail', 'Phone': 'Telefon', 'Send a message': 'Nachricht senden', 'Name': 'Name', 'Message': 'Nachricht', 'Send': 'Senden',
    },
  };

  // first browser language we support; English (the HTML itself) otherwise
  const lang = (navigator.languages || [navigator.language]).map(l => l.slice(0, 2).toLowerCase()).find(l => l === 'en' || T[l]);
  const dict = T[lang] || {};
  window.t = s => dict[s] ?? s;
  if (!T[lang]) return;

  document.documentElement.lang = lang;
  const [page, ...rest] = document.title.split(' · ');
  document.title = [t(page), ...rest].join(' · ');
  document.querySelectorAll('[aria-label]').forEach(el => el.setAttribute('aria-label', t(el.getAttribute('aria-label'))));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    const key = n.data.trim();
    if (key && dict[key]) n.data = n.data.replace(key, dict[key]); // keeps surrounding spaces
  }
})();
