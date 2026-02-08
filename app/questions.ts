// app/questions.ts

export const QUESTIONS_DB = [
  {
    id: 1,
    text: "Um cliente entra na loja faltando 2 minutos para fechar. Ele parece indeciso e não sabe o que quer. A equipe já está apagando as luzes.",
    options: [
      { id: '1a', text: 'Aviso educadamente que o sistema encerra automaticamente em 2 minutos.', scores: { flexibilidade: -2, empatia: -1 } }, // Risco: Rigidez
      { id: '1b', text: 'Atendo normalmente, mas tento direcioná-lo para itens de decisão rápida.', scores: { vendas: 3, inteligencia_emocional: 2 } }, // Ideal
      { id: '1c', text: 'Permaneço em silêncio esperando ele decidir, mesmo que tenhamos que fazer hora extra.', scores: { produtividade: -1, assertividade: -1 } }, // Passividade
      { id: '1d', text: 'Peço para ele voltar amanhã cedo para ser atendido com mais calma.', scores: { vendas: -3 } } // Perda de venda
    ]
  },
  {
    id: 2,
    text: "Você percebe que um colega experiente está usando um 'atalho' no sistema para vender mais rápido, mas isso viola uma regra de segurança de dados leve.",
    options: [
      { id: '2a', text: 'Começo a fazer igual, afinal ele é experiente e vende bem.', scores: { etica: -3, processos: -2 } }, // Maria vai com as outras
      { id: '2b', text: 'Ignoro. Se a gerência não viu, não é problema meu.', scores: { responsabilidade: -2, omissao: -1 } },
      { id: '2c', text: 'Pergunto a ele sobre o risco e, se ele continuar, converso com o supervisor.', scores: { etica: 3, coragem: 2 } }, // Ideal
      { id: '2d', text: 'Denuncio imediatamente ao RH sem falar com ele antes.', scores: { equipe: -2, lealdade: -1 } } // Conflito desnecessário
    ]
  },
  {
    id: 3,
    text: "A loja está cheia. Um cliente te aborda irritado reclamando de um produto que comprou errado, mas a política da loja diz que não troca produtos abertos.",
    options: [
      { id: '3a', text: 'Mostro a placa da política de troca e digo que não posso fazer nada.', scores: { empatia: -3, negociacao: -2 } }, // "Robô"
      { id: '3b', text: 'Chamo o gerente imediatamente para me livrar do problema.', scores: { autonomia: -2, resolucao: -1 } },
      { id: '3c', text: 'Escuto a reclamação, explico a regra com calma, mas tento oferecer um desconto em outro item.', scores: { resiliencia: 3, negociacao: 3 } }, // Ideal
      { id: '3d', text: 'Faço a troca escondido para o cliente parar de gritar e não atrapalhar as outras vendas.', scores: { processos: -3, firmeza: -2 } } // Cede à pressão
    ]
  },
  {
    id: 4,
    text: "Sua meta pessoal está baixa este mês. Um cliente quer comprar um produto caro (Comissão alta), mas você sabe que aquele modelo costuma dar muito defeito.",
    options: [
      { id: '4a', text: 'Vendo o produto. A fábrica dá garantia, então o cliente está coberto.', scores: { visao_longo_prazo: -2, etica: -1, vendas_curto_prazo: 2 } },
      { id: '4b', text: 'Aviso que dá defeito e não vendo nada se ele não quiser outro.', scores: { vendas: -2, persuasao: -1 } },
      { id: '4c', text: 'Tento convencer o cliente a levar um modelo mais barato, mas mais confiável.', scores: { fidelizacao: 3, etica: 3, vendas: 1 } }, // Ideal (fideliza)
      { id: '4d', text: 'Vendo e rezo para não quebrar.', scores: { responsabilidade: -2 } }
    ]
  },
  {
    id: 5,
    text: "O gerente pede para você organizar o estoque num dia em que você estava focado em bater sua meta de vendas.",
    options: [
      { id: '5a', text: 'Faço, mas com a "cara fechada" para ele notar meu descontentamento.', scores: { inteligencia_emocional: -2, postura: -1 } },
      { id: '5b', text: 'Explico que estou perto da meta e proponho organizar no horário de menor movimento.', scores: { negociacao: 3, foco_resultado: 2 } }, // Ideal
      { id: '5c', text: 'Faço correndo de qualquer jeito para voltar logo a vender.', scores: { capricho: -2, disciplina: -1 } },
      { id: '5d', text: 'Digo que fui contratado para vender, não para arrumar caixa.', scores: { equipe: -3, flexibilidade: -3 } }
    ]
  },
  {
    id: 6,
    text: "Você cometeu um erro ao passar o troco e o caixa deu uma diferença de R$ 20,00 (falta). Ninguém viu.",
    options: [
      { id: '6a', text: 'Coloco do meu bolso discretamente para não ter que explicar.', scores: { transparencia: -1, responsabilidade: 1 } }, // Resolve, mas esconde
      { id: '6b', text: 'Deixo assim. Erros acontecem e a quebra de caixa serve para isso.', scores: { responsabilidade: -2, etica: -1 } },
      { id: '6c', text: 'Informo o gerente, assumo o erro e pergunto qual o procedimento padrão.', scores: { etica: 3, maturidade: 3 } }, // Ideal
      { id: '6d', text: 'Tento recuperar o valor cobrando a mais de um próximo cliente distraído.', scores: { etica: -10, criminalidade: 10 } }
    ]
  },
  {
    id: 7,
    text: "Um cliente pede um desconto que você não tem autorização para dar, e diz: 'Na outra loja eles fazem'.",
    options: [
      { id: '7a', text: 'Digo: "Então o senhor deve comprar lá".', scores: { polidez: -3, vendas: -3 } }, // Grosseiro
      { id: '7b', text: 'Dou o desconto. Melhor pedir desculpas ao chefe depois do que perder a venda.', scores: { disciplina: -2, ousadia: 1 } }, // Insubordinação
      { id: '7c', text: 'Foco nos diferenciais do nosso serviço/garantia para justificar o preço.', scores: { argumentacao: 3, vendas: 2 } }, // Ideal
      { id: '7d', text: 'Chamo o gerente imediatamente.', scores: { autonomia: -1 } }
    ]
  },
  {
    id: 8,
    text: "Você está atendendo um cliente difícil, e seu celular toca. É uma ligação urgente de família.",
    options: [
      { id: '8a', text: 'Atendo na frente do cliente e peço um minuto.', scores: { postura: -2, foco: -2 } },
      { id: '8b', text: 'Rejeito a chamada e continuo o atendimento como se nada tivesse acontecido.', scores: { foco: 3, profissionalismo: 2 } }, // Ideal (se for realmente grave, pede licença e sai)
      { id: '8c', text: 'Olho quem é, peço licença educadamente ao cliente e atendo rapidinho no canto.', scores: { equilibrio: 1, postura: -1 } }, // Aceitável, mas arriscado
      { id: '8d', text: 'Deixo tocando até parar.', scores: { postura: -1 } }
    ]
  },
  {
    id: 9,
    text: "A equipe de limpeza faltou e o chão da loja está sujo de barro. O que você faz?",
    options: [
      { id: '9a', text: 'Continuo trabalhando, não sou da limpeza.', scores: { proatividade: -3, equipe: -2 } },
      { id: '9b', text: 'Ligo para o dono reclamando da gestão.', scores: { resolucao: -1, atitude: -2 } },
      { id: '9c', text: 'Pego a vassoura e limpo, ou organizo um revezamento com os colegas.', scores: { lideranca: 3, humildade: 3, dono: 3 } }, // Ideal
      { id: '9d', text: 'Fico desviando da sujeira.', scores: { capricho: -2 } }
    ]
  },
  {
    id: 10,
    text: "Um cliente elogia muito seu atendimento, mas critica duramente a loja e os produtos.",
    options: [
      { id: '10a', text: 'Concordo com ele para criar conexão ("É, aqui é bagunçado mesmo").', scores: { lealdade: -3, profissionalismo: -2 } }, // O "Amigo" do cliente
      { id: '10b', text: 'Defendo a loja agressivamente.', scores: { inteligencia_emocional: -2 } },
      { id: '10c', text: 'Agradeço o elogio, registro a crítica dele como feedback e mudo de assunto.', scores: { postura: 3, lealdade: 2 } }, // Ideal
      { id: '10d', text: 'Ignoro o que ele disse.', scores: { empatia: -1 } }
    ]
  },
  {
    id: 11,
    text: "Você vê um produto na prateleira levemente danificado, mas ainda vendável. Se marcar como defeito, a loja perde dinheiro.",
    options: [
      { id: '11a', text: 'Escondo no fundo da prateleira para ninguém ver.', scores: { proatividade: -2 } },
      { id: '11b', text: 'Tento vender para um cliente menos atento.', scores: { etica: -3, visao_cliente: -3 } },
      { id: '11c', text: 'Mostro ao gerente e sugiro colocar na área de "promoção/avaria".', scores: { honestidade: 3, solucao: 2 } }, // Ideal
      { id: '11d', text: 'Jogo no lixo para não dar problema.', scores: { responsabilidade_patrimonial: -3 } }
    ]
  },
  {
    id: 12,
    text: "Está um dia muito calmo, sem clientes há 1 hora. O gerente saiu.",
    options: [
      { id: '12a', text: 'Sento e mexo no Instagram para passar o tempo.', scores: { autogerenciamento: -2, foco: -2 } },
      { id: '12b', text: 'Aproveito para estudar o catálogo de produtos novos ou repor mercadoria.', scores: { proatividade: 3, curiosidade: 2 } }, // Ideal
      { id: '12c', text: 'Fico conversando com os colegas.', scores: { foco: -1 } },
      { id: '12d', text: 'Vou para a porta olhar o movimento da rua.', scores: { passividade: 1 } }
    ]
  },
  {
    id: 13,
    text: "Dois colegas estão discutindo alto na frente dos clientes sobre quem é a vez de atender.",
    options: [
      { id: '13a', text: 'Grito para eles pararem.', scores: { inteligencia_emocional: -2 } },
      { id: '13b', text: 'Finjo que não é comigo e continuo meu trabalho.', scores: { lideranca: -1, omissao: -1 } },
      { id: '13c', text: 'Chego perto e falo baixo: "Pessoal, tem cliente olhando, vamos resolver no fundo".', scores: { lideranca: 3, equipe: 2 } }, // Ideal
      { id: '13d', text: 'Atendo o cliente eu mesmo e fico com a comissão.', scores: { oportunismo: 1, equipe: -1 } }
    ]
  },
  {
    id: 14,
    text: "Um cliente prova 10 roupas, deixa tudo bagunçado no provador e sai sem levar nada.",
    options: [
      { id: '14a', text: 'Reclamo alto: "Que falta de educação!".', scores: { controle: -2, postura: -2 } },
      { id: '14b', text: 'Arrumo imediatamente, checando se as peças não foram danificadas.', scores: { resiliencia: 3, diligencia: 2 } }, // Ideal
      { id: '14c', text: 'Deixo bagunçado até o fim do dia.', scores: { organizacao: -2 } },
      { id: '14d', text: 'Chuto as roupas para o canto.', scores: { profissionalismo: -3 } }
    ]
  },
  {
    id: 15,
    text: "O sistema cai na hora de passar uma compra grande. O cliente está com pressa.",
    options: [
      { id: '15a', text: 'Digo: "O sistema é horrível mesmo, vive caindo".', scores: { postura: -2, lealdade: -1 } },
      { id: '15b', text: 'Fico tentando passar o cartão repetidamente em silêncio.', scores: { comunicacao: -1 } },
      { id: '15c', text: 'Explico a situação com calma, ofereço uma água e tento uma alternativa (dinheiro/pix/nota manual).', scores: { resolucao: 3, calma: 3 } }, // Ideal
      { id: '15d', text: 'Digo para ele voltar mais tarde.', scores: { persistencia: -2 } }
    ]
  },
  {
    id: 16,
    text: "Sua comissão é individual. Um colega novo pede ajuda para fechar uma venda difícil. Se você ajudar, a venda vai para ele.",
    options: [
      { id: '16a', text: 'Digo que estou ocupado.', scores: { equipe: -2, egoismo: 2 } },
      { id: '16b', text: 'Ajudo, mas depois exijo metade da comissão.', scores: { negociacao: 1, coleguismo: -1 } },
      { id: '16c', text: 'Assumo a venda e tiro ele da jogada.', scores: { etica: -2, agressividade: 1 } },
      { id: '16d', text: 'Ajudo com prazer, pois um time forte vende mais e ele pode me ajudar no futuro.', scores: { visao_sistemica: 3, equipe: 3 } } // Ideal
    ]
  },
  {
    id: 17,
    text: "Você recebe uma mercadoria e nota que veio uma caixa a mais que não consta na nota fiscal.",
    options: [
      { id: '17a', text: 'Fico quieto. Lucro para a empresa.', scores: { honestidade: -1, compliance: -2 } }, // Parece bom pro dono, mas gera problema fiscal/estoque
      { id: '17b', text: 'Aviso o fornecedor ou gerente para regularizar.', scores: { honestidade: 3, responsabilidade: 3 } }, // Ideal
      { id: '17c', text: 'Levo para casa.', scores: { roubo: 10, etica: -10 } },
      { id: '17d', text: 'Divido entre os funcionários.', scores: { lideranca_negativa: 2, etica: -5 } }
    ]
  },
  {
    id: 18,
    text: "A empresa lança uma meta muito agressiva (quase impossível) para o mês.",
    options: [
      { id: '18a', text: 'Já começo o mês desanimado reclamando que é impossível.', scores: { resiliencia: -2, atitude: -2 } },
      { id: '18b', text: 'Ignoro a meta e faço meu ritmo normal.', scores: { ambicao: -1 } },
      { id: '18c', text: 'Traço uma estratégia diária para tentar chegar o mais perto possível.', scores: { planejamento: 3, ambicao: 2 } }, // Ideal
      { id: '18d', text: 'Forço vendas empurrando produtos que o cliente não precisa.', scores: { etica: -2, vendas_agressivas: 2 } } // Risco de devolução
    ]
  },
  {
    id: 19,
    text: "Um cliente acusa você de ter dado o troco errado, mas você tem certeza que deu certo.",
    options: [
      { id: '19a', text: 'Bato boca e digo que ele está mentindo.', scores: { controle: -3, postura: -3 } },
      { id: '19b', text: 'Dou o dinheiro que ele pede para evitar barraco.', scores: { firmeza: -2, processos: -1 } },
      { id: '19c', text: 'Solicito a conferência do caixa (sangria) na frente dele para provar.', scores: { profissionalismo: 3, transparencia: 3 } }, // Ideal
      { id: '19d', text: 'Chamo a segurança.', scores: { bom_senso: -2 } }
    ]
  },
  {
    id: 20,
    text: "Você tem uma ideia para mudar a vitrine, mas o gerente é conservador e não gosta de mudanças.",
    options: [
      { id: '20a', text: 'Não falo nada, ele que manda.', scores: { proatividade: -1 } },
      { id: '20b', text: 'Mudo a vitrine quando ele sai.', scores: { insubordinacao: 2, disciplina: -2 } },
      { id: '20c', text: 'Monto um projeto/argumento mostrando como isso pode aumentar vendas e apresento.', scores: { proatividade: 3, inteligencia: 2 } }, // Ideal
      { id: '20d', text: 'Falo mal da vitrine atual para os clientes.', scores: { lealdade: -3 } }
    ]
  },
  {
    id: 21,
    text: "Um cliente entra na loja com roupas simples e chinelo. Outro entra de terno.",
    options: [
      { id: '21a', text: 'Atendo o de terno primeiro, pois tem mais dinheiro.', scores: { preconceito: 2, etica: -3 } },
      { id: '21b', text: 'Atendo quem chegou primeiro com a mesma excelência.', scores: { etica: 3, profissionalismo: 3 } }, // Ideal
      { id: '21c', text: 'Vigio o de chinelo achando que vai roubar.', scores: { preconceito: 3, postura: -2 } },
      { id: '21d', text: 'Ignoro o de terno porque parece arrogante.', scores: { profissionalismo: -2 } }
    ]
  },
  {
    id: 22,
    text: "Faltou luz na loja por 1 hora. O sistema não funciona, mas a loja está clara (dia).",
    options: [
      { id: '22a', text: 'Fecho a loja e espero a luz voltar.', scores: { proatividade: -2, vendas: -3 } },
      { id: '22b', text: 'Continuo atendendo e anoto as vendas em papel para lançar depois.', scores: { resiliencia: 3, resolucao: 3 } }, // Ideal
      { id: '22c', text: 'Aviso os clientes que não podemos vender nada.', scores: { flexibilidade: -2 } },
      { id: '22d', text: 'Fico conversando no celular.', scores: { foco: -2 } }
    ]
  },
  {
    id: 23,
    text: "Um cliente pede para você guardar um produto por 1 semana sem pagar sinal, prometendo que volta.",
    options: [
      { id: '23a', text: 'Guardo, confio na palavra dele.', scores: { ingenuidade: 2, processos: -1 } },
      { id: '23b', text: 'Digo "Não" e viro as costas.', scores: { educacao: -2 } },
      { id: '23c', text: 'Explico que só posso reservar com um sinal ou por 24h (conforme regra), para não ser injusto com outros.', scores: { assertividade: 3, regras: 2 } }, // Ideal
      { id: '23d', text: 'Escondo o produto para mim mesmo.', scores: { etica: -2 } }
    ]
  },
  {
    id: 24,
    text: "Você está muito gripado, mas a loja está com pouca equipe hoje.",
    options: [
      { id: '24a', text: 'Vou trabalhar espirrando em cima dos clientes para mostrar compromisso.', scores: { bom_senso: -2, saude: -1 } }, // Risco de imagem
      { id: '24b', text: 'Falto sem avisar.', scores: { responsabilidade: -3 } },
      { id: '24c', text: 'Aviso o gestor com antecedência para ele tentar reposição ou vou de máscara e evito contato direto.', scores: { responsabilidade: 3, comunicacao: 2 } }, // Ideal
      { id: '24d', text: 'Vou trabalhar e passo o dia reclamando que estou doente.', scores: { clima: -2 } }
    ]
  },
  {
    id: 25,
    text: "O que te motiva mais a bater a meta?",
    options: [
      { id: '25a', text: 'O dinheiro da comissão, apenas.', scores: { motivacao_financeira: 3, cultura: 1 } },
      { id: '25b', text: 'O medo de ser demitido.', scores: { motivacao: -2, autoconfianca: -1 } },
      { id: '25c', text: 'A sensação de dever cumprido e o reconhecimento do time.', scores: { cultura: 3, engajamento: 3 } }, // Ideal
      { id: '25d', text: 'Ser melhor que meus colegas e esfregar na cara deles.', scores: { competitividade_toxica: 3, equipe: -3 } }
    ]
  }
];