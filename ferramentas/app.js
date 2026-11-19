(() => {
  const WHATSAPP_BASE = 'https://wa.me/5591986359017?text=';

  const WA_MESSAGES = {
    inicio: 'Olá, Dra. Larissa! Acessei o portal de ferramentas informativas e gostaria de orientações.',
    pensao: 'Olá, Dra. Larissa! Usei a Calculadora de Custo dos Filhos e Pensão no seu portal e gostaria de orientações sobre o meu caso.',
    regime: 'Olá, Dra. Larissa! Fiz a simulação de Regime de Bens e Pacto Antenupcial no seu portal e gostaria de orientações.',
    inventario: 'Olá, Dra. Larissa! Usei o Simulador de Inventário e Prazo no seu portal e gostaria de orientações.',
    violencia: 'Olá, Dra. Larissa! Fiz a autoavaliação no Termômetro de Violência Patrimonial e preciso de orientação confidencial.',
    checklist: 'Olá, Dra. Larissa! Gerei meu Checklist de Documentos no seu portal e gostaria de orientações sobre os próximos passos.'
  };

  function formatBRL(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  // Navegação SPA por hash
  const views = document.querySelectorAll('.view');
  const navPills = document.querySelectorAll('.nav-pill');
  const ctaLink = document.getElementById('cta-whatsapp-link');

  function openView(targetId, updateHash = true) {
    const valid = ['inicio', 'pensao', 'regime', 'inventario', 'violencia', 'checklist'];
    const viewName = valid.includes(targetId) ? targetId : 'inicio';

    views.forEach(v => v.classList.toggle('active', v.id === `view-${viewName}`));
    navPills.forEach(p => p.classList.toggle('active', p.dataset.target === viewName));

    if (ctaLink) {
      ctaLink.href = WHATSAPP_BASE + encodeURIComponent(WA_MESSAGES[viewName] || WA_MESSAGES.inicio);
    }

    if (updateHash) {
      history.replaceState(null, '', `#${viewName}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navPills.forEach(pill => {
    pill.addEventListener('click', () => openView(pill.dataset.target));
  });

  document.querySelectorAll('[data-open]').forEach(card => {
    card.addEventListener('click', () => openView(card.dataset.open));
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openView(link.dataset.nav);
    });
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) openView(initialHash, false);

  // =========================================================
  // 1. CALCULADORA DE CUSTO DOS FILHOS E ESTIMATIVA DE PENSÃO
  // =========================================================
  document.getElementById('btn-calc-pensao')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.expense-input');
    let totalGastos = 0;
    const itens = [];

    inputs.forEach(inp => {
      const val = Math.max(0, parseFloat(inp.value) || 0);
      totalGastos += val;
      if (val > 0) itens.push({ label: inp.dataset.label, val });
    });

    const rendaGuardiao = Math.max(0, parseFloat(document.getElementById('renda-guardiao').value) || 0);
    const rendaAlimentante = Math.max(0, parseFloat(document.getElementById('renda-alimentante').value) || 0);
    const qtdFilhos = Math.max(1, parseInt(document.getElementById('qtd-filhos').value, 10) || 1);

    const somaRendas = rendaGuardiao + rendaAlimentante;
    const propAlimentante = somaRendas > 0 ? (rendaAlimentante / somaRendas) : 0.5;
    const contribuicaoProporcional = totalGastos * propAlimentante;
    const percentualRenda = rendaAlimentante > 0 ? (contribuicaoProporcional / rendaAlimentante) * 100 : 0;

    const ref20 = rendaAlimentante * 0.20;
    const ref30 = rendaAlimentante * 0.30;

    const box = document.getElementById('resultado-pensao');
    box.innerHTML = `
      <span class="badge-status badge-ok">ESTIMATIVA EDUCATIVA CALCULADA</span>
      <h3>Resumo do Custo e Proporcionalidade (${qtdFilhos} ${qtdFilhos === 1 ? 'filho' : 'filhos'})</h3>
      <div class="kpi-grid">
        <div class="kpi">
          <span class="kpi-label">Custo mensal total informado</span>
          <span class="kpi-value">${formatBRL(totalGastos)}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Proporção estimada de quem paga (${(propAlimentante * 100).toFixed(0)}%)</span>
          <span class="kpi-value">${formatBRL(contribuicaoProporcional)}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Impacto na renda de quem paga</span>
          <span class="kpi-value">${percentualRenda.toFixed(1)}%</span>
        </div>
      </div>
      <p>
        <strong>Como a Justiça analisa:</strong> Não existe percentual fixo em lei. O juiz avalia o binômio
        <strong>necessidade da criança × possibilidade financeira de cada genitor</strong> (além dos cuidados diários
        de quem fica com a guarda).
      </p>
      ${rendaAlimentante > 0 ? `<p style="margin-top:8px;">Como referência prática de mercado, 20% a 30% da renda informada corresponderia a <strong>${formatBRL(ref20)} a ${formatBRL(ref30)}</strong>.</p>` : ''}
      <ul class="result-list">
        ${itens.map(i => `<li><strong>${i.label}:</strong> ${formatBRL(i.val)}</li>`).join('')}
      </ul>
    `;
    box.classList.remove('hidden');
  });

  // =========================================================
  // 2. SIMULADOR DE REGIME DE BENS E PACTO ANTENUPCIAL
  // =========================================================
  document.getElementById('form-regime')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const temBens = data.get('r1') === 'sim';
    const temEmpresa = data.get('r2') === 'sim';
    const temFilhosAnt = data.get('r3') === 'sim';
    const riscoDivida = data.get('r4') === 'sim';
    const querDividir = data.get('r5') === 'sim';
    const tipoRelacao = data.get('r6');

    let titulo = 'Comunhão Parcial de Bens';
    let badge = 'REGIME LEGAL PADRÃO';
    let resumo = 'Tudo o que for adquirido de forma onerosa durante a relação pertence aos dois (50%/50%), enquanto bens anteriores e heranças ficam particulares.';
    const pontos = [];

    if (!querDividir || temEmpresa || riscoDivida) {
      titulo = 'Separação Convencional (Total) de Bens';
      badge = 'PROTEÇÃO PATRIMONIAL REFORÇADA';
      resumo = 'Cada um mantém administração e propriedade exclusiva do que já tem e do que adquirir no futuro — protegendo patrimônio pessoal contra riscos empresariais e dívidas do outro.';
    } else if (temBens || temFilhosAnt) {
      titulo = 'Comunhão Parcial com Pacto / Escritura Estratégica';
      badge = 'ATENÇÃO A BENS E HERDEIROS';
      resumo = 'A Comunhão Parcial separa o que veio antes, mas frutos, rendimentos (como aluguéis de imóveis antigos) e valorizações podem gerar discussão sem um Pacto Antenupcial ou Escritura bem redigida.';
    }

    if (tipoRelacao === 'casamento' && titulo !== 'Comunhão Parcial de Bens') {
      pontos.push('Exige <strong>Pacto Antenupcial</strong> lavrado em Cartório de Notas antes do casamento civil.');
    }
    if (tipoRelacao === 'uniao') {
      pontos.push('Na União Estável, sem contrato escrito (Escritura Pública), aplica-se automaticamente a <strong>Comunhão Parcial de Bens</strong>.');
    }
    if (temEmpresa || riscoDivida) {
      pontos.push('Se há CNPJ/sociedade, a Separação Convencional reduz o risco de bloqueio judicial atingir o patrimônio do outro cônjuge.');
    }
    if (temFilhosAnt) {
      pontos.push('Havendo filhos de outro relacionamento, o regime de bens impacta diretamente a divisão da herança (sucessão) no futuro.');
    }
    pontos.push('Mesmo na Separação Convencional, o cônjuge continua sendo herdeiro necessário em regra — planejamento sucessório resolve esse ponto.');

    const box = document.getElementById('resultado-regime');
    box.innerHTML = `
      <span class="badge-status badge-warn">${badge}</span>
      <h3>Cenário indicado para análise: ${titulo}</h3>
      <p>${resumo}</p>
      <ul class="result-list">
        ${pontos.map(p => `<li>${p}</li>`).join('')}
      </ul>
    `;
    box.classList.remove('hidden');
  });

  // =========================================================
  // 3. SIMULADOR DE INVENTÁRIO E PRAZO LEGAL
  // =========================================================
  document.getElementById('form-inventario')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const dataObitoStr = document.getElementById('inv-data').value;
    const [uf, aliquota] = document.getElementById('inv-uf').value.split('|');
    const acordo = document.getElementById('inv-acordo').value === 'sim';
    const menores = document.getElementById('inv-menores').value === 'sim';
    const testamento = document.getElementById('inv-testamento').value === 'sim';
    const valor = Math.max(0, parseFloat(document.getElementById('inv-valor').value) || 0);

    const obito = new Date(`${dataObitoStr}T00:00:00`);
    const hoje = new Date();
    const diffDias = Math.floor((hoje - obito) / (1000 * 60 * 60 * 24));
    const prazoRestante = 60 - diffDias;

    let prazoHtml = '';
    if (diffDias < 0) {
      prazoHtml = '<span class="badge-status badge-warn">DATA FUTURA INFORMADA</span>';
    } else if (prazoRestante >= 0) {
      prazoHtml = `<span class="badge-status badge-ok">DENTRO DO PRAZO LEGAL — RESTAM ${prazoRestante} DIAS (de 60 dias)</span>`;
    } else {
      prazoHtml = `<span class="badge-status badge-high">PRAZO DE 60 DIAS ULTRAPASSADO HÁ ${Math.abs(prazoRestante)} DIAS (RISCO DE MULTA NO ITCMD)</span>`;
    }

    let via = 'Inventário Extrajudicial (em Cartório)';
    let viaDesc = 'Quando há consenso entre os herdeiros e não há menores/incapazes, o inventário pode ser feito em Cartório com advogada, sendo muito mais rápido.';
    if (!acordo) {
      via = 'Inventário Judicial';
      viaDesc = 'Como há divergência entre os herdeiros, o processo precisa tramitar na Justiça.';
    } else if (menores || testamento) {
      via = 'Inventário Judicial (com possibilidade de Cartório mediante autorização/regras do CNJ)';
      viaDesc = 'A presença de menores/incapazes ou testamento exige cuidados específicos e participação do Ministério Público ou autorização judicial prévia (Resolução CNJ 571/2024).';
    }

    const box = document.getElementById('resultado-inventario');
    box.innerHTML = `
      ${prazoHtml}
      <h3>Via provável: ${via}</h3>
      <p>${viaDesc}</p>
      <div class="kpi-grid">
        <div class="kpi">
          <span class="kpi-label">Patrimônio informado</span>
          <span class="kpi-value">${formatBRL(valor)}</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Referência de ITCMD (${uf})</span>
          <span class="kpi-value">${aliquota}%</span>
        </div>
        <div class="kpi">
          <span class="kpi-label">Dias desde o falecimento</span>
          <span class="kpi-value">${diffDias >= 0 ? diffDias : 0} dias</span>
        </div>
      </div>
      <ul class="result-list">
        <li><strong>Prazo legal (art. 611 CPC):</strong> O inventário deve ser aberto em até 60 dias do óbito para evitar multa estadual sobre o ITCMD.</li>
        <li><strong>Custos envolvidos:</strong> Imposto estadual (ITCMD), taxas de cartório ou custas judiciais, certidões atualizadas e honorários advocatícios.</li>
        <li><strong>Dica prática:</strong> Mesmo sem todo o dinheiro do imposto hoje, é possível protocolar a abertura para travar o prazo e evitar multa.</li>
      </ul>
    `;
    box.classList.remove('hidden');
  });

  // =========================================================
  // 4. TERMÔMETRO DE VIOLÊNCIA PATRIMONIAL
  // =========================================================
  document.getElementById('form-violencia')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const marcados = document.querySelectorAll('#form-violencia input[name="vp"]:checked').length;

    let badge = '<span class="badge-status badge-ok">NENHUM SINAL MARCADO</span>';
    let titulo = 'Sem sinais evidentes marcados nesta triagem';
    let texto = 'Mesmo sem sinais marcados, manter independência financeira, cópia de documentos e transparência patrimonial é sempre recomendado.';

    if (marcados >= 1 && marcados <= 2) {
      badge = '<span class="badge-status badge-warn">SINAL DE ALERTA MODERADO (' + marcados + ' sinais)</span>';
      titulo = 'Atenção: há indícios que merecem cuidado';
      texto = 'Pequenos controles financeiros ou falta de transparência sobre bens costumam se agravar em momentos de crise conjugal. Documente movimentações e busque orientação sigilosa.';
    } else if (marcados >= 3) {
      badge = '<span class="badge-status badge-high">ALERTA ALTO DE VIOLÊNCIA PATRIMONIAL (' + marcados + ' sinais)</span>';
      titulo = 'Forte indício de Violência Patrimonial (Art. 7º, IV, Lei Maria da Penha)';
      texto = 'Reter salário, destruir documentos, fazer dívidas no seu nome ou ocultar bens comuns é crime e violência doméstica prevista em lei — mesmo sem agressão física.';
    }

    const box = document.getElementById('resultado-violencia');
    box.innerHTML = `
      ${badge}
      <h3>${titulo}</h3>
      <p>${texto}</p>
      <ul class="result-list">
        <li><strong>O que a lei protege:</strong> É possível pedir judicialmente bloqueio de bens/contas, restituição de valores, proibição de venda de patrimônio comum e alimentos provisionais urgentes.</li>
        <li><strong>Como se resguardar hoje:</strong> Guarde fotos/prints de extratos, contratos, matrículas de imóveis e boletins de ocorrência se houver retenção de documentos.</li>
        <li><strong>Canais de emergência:</strong> Ligue <strong>180</strong> (Central da Mulher) ou <strong>190</strong> em caso de risco imediato.</li>
      </ul>
    `;
    box.classList.remove('hidden');
  });

  // =========================================================
  // 5. GERADOR DE CHECKLIST PERSONALIZADO DE DOCUMENTOS
  // =========================================================
  document.getElementById('form-checklist')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tipo = document.getElementById('chk-tipo').value;
    const filhos = document.getElementById('chk-filhos').checked;
    const imoveis = document.getElementById('chk-imoveis').checked;
    const empresa = document.getElementById('chk-empresa').checked;
    const urgencia = document.getElementById('chk-urgencia').checked;

    const titulos = {
      divorcio: 'Divórcio (Consensual ou Litigioso)',
      pensao: 'Pensão Alimentícia (Fixação ou Revisão)',
      guarda: 'Guarda e Convivência dos Filhos',
      uniao: 'Reconhecimento ou Dissolução de União Estável',
      inventario: 'Inventário e Partilha de Herança'
    };

    const pessoais = [
      'RG e CPF (ou CNH) de quem está requerendo',
      'Comprovante de residência atualizado (últimos 90 dias)',
      tipo === 'divorcio' ? 'Certidão de Casamento atualizada (emitida há no máximo 90 dias)' : null,
      tipo === 'uniao' ? 'Provas da convivência pública (fotos, contas no mesmo endereço, plano de saúde conjunto, escritura se houver)' : null,
      tipo === 'inventario' ? 'Certidão de Óbito, RG/CPF do falecido e certidão negativa de testamento (CENSEC)' : null,
      tipo === 'inventario' ? 'RG, CPF e certidões de nascimento/casamento de todos os herdeiros' : null
    ].filter(Boolean);

    const filhosDocs = filhos ? [
      'Certidão de nascimento ou RG/CPF de cada filho',
      'Planilha ou recibos dos gastos mensais dos filhos (escola, plano de saúde, farmácia, alimentação, transporte)',
      'Comprovantes de matrícula escolar e histórico médico/terapias (se aplicável)'
    ] : [];

    const patrimonioDocs = [];
    if (imoveis) {
      patrimonioDocs.push(
        'Matrícula atualizada dos imóveis (emitida pelo Cartório de Registro de Imóveis)',
        'Contratos de financiamento, compra e venda ou IPTU recente',
        'CRLV dos veículos e extrato de saldo de financiamento/consórcio'
      );
    }
    if (empresa) {
      patrimonioDocs.push(
        'Contrato Social e última alteração contratual (ou certificado MEI)',
        'Balanço patrimonial / faturamento recente e declaração de IRPJ'
      );
    }
    if (tipo === 'pensao' || tipo === 'divorcio' || tipo === 'uniao') {
      patrimonioDocs.push(
        'Comprovantes de renda do requerente e indícios de renda/padrão de vida da outra parte (contracheques, IRPF, extratos, redes sociais)'
      );
    }

    const urgenciaDocs = urgencia ? [
      'Prints de conversas, ameaças ou recusas financeiras com data visível',
      'Boletim de Ocorrência (se houver violência física, psicológica ou patrimonial)',
      'Relação de contas bancárias conjuntas ou bens com risco de venda imediata'
    ] : [];

    const box = document.getElementById('resultado-checklist');
    box.innerHTML = `
      <span class="badge-status badge-ok">CHECKLIST GERADO PARA IMPRESSÃO / PDF</span>
      <h3>Documentos para: ${titulos[tipo]}</h3>
      <p>Organize o que já tiver em mãos (não precisa ter 100% para fazer a primeira orientação jurídica).</p>

      <h4 style="margin-top:16px;">1. Documentos Pessoais e Básicos</h4>
      <ul class="result-list">${pessoais.map(d => `<li>☐ ${d}</li>`).join('')}</ul>

      ${filhosDocs.length ? `<h4 style="margin-top:16px;">2. Sobre os Filhos</h4><ul class="result-list">${filhosDocs.map(d => `<li>☐ ${d}</li>`).join('')}</ul>` : ''}

      ${patrimonioDocs.length ? `<h4 style="margin-top:16px;">3. Patrimônio e Renda</h4><ul class="result-list">${patrimonioDocs.map(d => `<li>☐ ${d}</li>`).join('')}</ul>` : ''}

      ${urgenciaDocs.length ? `<h4 style="margin-top:16px;">4. Provas de Urgência / Proteção</h4><ul class="result-list">${urgenciaDocs.map(d => `<li>☐ ${d}</li>`).join('')}</ul>` : ''}
    `;
    box.classList.remove('hidden');
  });
})();
