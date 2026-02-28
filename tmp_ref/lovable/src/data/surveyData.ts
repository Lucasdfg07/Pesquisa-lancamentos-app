// Survey response data parsed from spreadsheet
// Lead Score Weights:
// Tempo como programador: 25 pts | Motivação: 20 pts | Entrevista internacional: 20 pts
// Nível de inglês: 18 pts | Domina linguagem: 10 pts | Faixa salarial: 7 pts

export interface SurveyResponse {
  id: number;
  name: string;
  email: string;
  date: string;
  tempoProgramador: string;
  dominaLinguagem: string;
  nivelIngles: string;
  entrevistaInternacional: string;
  motivacao: string;
  faixaSalarial: string;
  leadScore: number;
}

export const questionLabels = {
  tempoProgramador: "Tempo como Programador",
  dominaLinguagem: "Domina Linguagem",
  nivelIngles: "Nível de Inglês",
  entrevistaInternacional: "Entrevista Internacional",
  motivacao: "Motivação",
  faixaSalarial: "Faixa Salarial",
};

export const questionWeights: Record<string, number> = {
  tempoProgramador: 25,
  dominaLinguagem: 10,
  nivelIngles: 18,
  entrevistaInternacional: 20,
  motivacao: 20,
  faixaSalarial: 7,
};

export const scoreMap: Record<string, Record<string, number>> = {
  tempoProgramador: {
    "Mais de 1 ano": 25,
    "1 ano": 20,
    "6 meses": 12,
    "Estágio": 8,
    "Nunca": 0,
  },
  dominaLinguagem: {
    "Domino bem": 10,
    "Aprendendo": 7,
    "Básico": 5,
    "Começando": 3,
    "Nunca programei": 0,
  },
  nivelIngles: {
    "Avançado/Fluente": 18,
    "Intermediário": 13,
    "Básico": 8,
    "Iniciante": 4,
    "Não falo inglês": 0,
  },
  entrevistaInternacional: {
    "Regularmente": 20,
    "Algumas vezes": 15,
    "Uma vez": 10,
    "Sempre tive vontade": 5,
    "Primeira vez": 0,
  },
  motivacao: {
    "Muito motivado": 20,
    "Interessado": 15,
    "Curioso": 10,
    "Sem interesse": 0,
  },
  faixaSalarial: {
    "Acima de R$ 15.000": 7,
    "R$ 10.001 - R$ 15.000": 6,
    "R$ 6.001 - R$ 10.000": 5,
    "R$ 3.001 - R$ 6.000": 3,
    "Até R$ 3.000": 1,
  },
};

// Colors for each answer option per question
export const answerColors: Record<string, Record<string, string>> = {
  tempoProgramador: {
    "Mais de 1 ano": "hsl(130, 60%, 45%)",
    "1 ano": "hsl(180, 70%, 45%)",
    "6 meses": "hsl(45, 80%, 55%)",
    "Estágio": "hsl(30, 90%, 55%)",
    "Nunca": "hsl(0, 72%, 55%)",
  },
  dominaLinguagem: {
    "Domino bem": "hsl(130, 60%, 45%)",
    "Aprendendo": "hsl(180, 70%, 45%)",
    "Básico": "hsl(45, 80%, 55%)",
    "Começando": "hsl(30, 90%, 55%)",
    "Nunca programei": "hsl(0, 72%, 55%)",
  },
  nivelIngles: {
    "Avançado/Fluente": "hsl(130, 60%, 45%)",
    "Intermediário": "hsl(180, 70%, 45%)",
    "Básico": "hsl(45, 80%, 55%)",
    "Iniciante": "hsl(30, 90%, 55%)",
    "Não falo inglês": "hsl(0, 72%, 55%)",
  },
  entrevistaInternacional: {
    "Regularmente": "hsl(130, 60%, 45%)",
    "Algumas vezes": "hsl(180, 70%, 45%)",
    "Uma vez": "hsl(45, 80%, 55%)",
    "Sempre tive vontade": "hsl(30, 90%, 55%)",
    "Primeira vez": "hsl(0, 72%, 55%)",
  },
  motivacao: {
    "Muito motivado": "hsl(130, 60%, 45%)",
    "Interessado": "hsl(180, 70%, 45%)",
    "Curioso": "hsl(45, 80%, 55%)",
    "Sem interesse": "hsl(0, 72%, 55%)",
  },
  faixaSalarial: {
    "Acima de R$ 15.000": "hsl(130, 60%, 45%)",
    "R$ 10.001 - R$ 15.000": "hsl(160, 60%, 45%)",
    "R$ 6.001 - R$ 10.000": "hsl(180, 70%, 45%)",
    "R$ 3.001 - R$ 6.000": "hsl(45, 80%, 55%)",
    "Até R$ 3.000": "hsl(0, 72%, 55%)",
  },
};

function calcScore(r: Omit<SurveyResponse, "id" | "leadScore">): number {
  return (
    (scoreMap.tempoProgramador[r.tempoProgramador] ?? 0) +
    (scoreMap.dominaLinguagem[r.dominaLinguagem] ?? 0) +
    (scoreMap.nivelIngles[r.nivelIngles] ?? 0) +
    (scoreMap.entrevistaInternacional[r.entrevistaInternacional] ?? 0) +
    (scoreMap.motivacao[r.motivacao] ?? 0) +
    (scoreMap.faixaSalarial[r.faixaSalarial] ?? 0)
  );
}

const rawData: Omit<SurveyResponse, "id" | "leadScore">[] = [
  { name: "Eliel", email: "eliel.doug26@gmail.com", date: "2026-01-14", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Uma vez", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Fausto", email: "fausto@faustoalves.com.br", date: "2026-01-16", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Tyller", email: "tylee.fne@gmail.com", date: "2026-01-16", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Iniciante", entrevistaInternacional: "Sempre tive vontade", motivacao: "Curioso", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "José Luis", email: "joselbsimao18@yahoo.com.br", date: "2026-01-16", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Carlos Eduardo", email: "kaduesr@gmail.com", date: "2026-01-17", tempoProgramador: "Nunca", dominaLinguagem: "Começando", nivelIngles: "Iniciante", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Eduardo", email: "eduardo.moraes.ritter@gmail.com", date: "2026-01-17", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Curioso", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Elias", email: "eliasbrufmg@gmail.com", date: "2026-01-17", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Iniciante", entrevistaInternacional: "Sempre tive vontade", motivacao: "Interessado", faixaSalarial: "Até R$ 3.000" },
  { name: "Vinicius", email: "nascimento.vinicius32@gmail.com", date: "2026-01-18", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Interessado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Fernando", email: "feryamaha@hotmail.com", date: "2026-01-18", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Básico", entrevistaInternacional: "Uma vez", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Raisa", email: "raisa.gagliano@gmail.com", date: "2026-01-18", tempoProgramador: "Estágio", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Samuel", email: "samuelhermany1012@gmail.com", date: "2026-01-18", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Interessado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Leandro Martins", email: "leandro.martins.85@gmail.com", date: "2026-01-19", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Arthur", email: "ac-silva95@hotmail.com", date: "2026-01-19", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Fernando", email: "fca.apps@gmail.com", date: "2026-01-20", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Iago", email: "iagox38@hotmail.com", date: "2026-01-20", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Iniciante", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Felipe", email: "felipenetto00@gmail.com", date: "2026-01-20", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Uma vez", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Marcio", email: "marcio.rmartinss@gmail.com", date: "2026-01-20", tempoProgramador: "Nunca", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Igor", email: "delimaigor781@gmail.com", date: "2026-01-20", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Regularmente", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Guilherme", email: "guiblourenco@hotmail.com", date: "2026-01-21", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "João", email: "roedorlarry5@gmail.com", date: "2026-01-21", tempoProgramador: "1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Lorenzo", email: "lorenzocarnielweber@icloud.com", date: "2026-01-21", tempoProgramador: "1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Tiago", email: "tiagorochausa@gmail.com", date: "2026-01-21", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Primeira vez", motivacao: "Interessado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Alexandre", email: "alexandre-porto@hotmail.com", date: "2026-01-21", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Intermediário", entrevistaInternacional: "Uma vez", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Matheus", email: "mttoorress1@gmail.com", date: "2026-01-21", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Iniciante", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Luiz", email: "lhpegnolatto@gmail.com", date: "2026-01-21", tempoProgramador: "1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Iniciante", entrevistaInternacional: "Primeira vez", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Matheus", email: "oliveiramatheus02@hotmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Uma vez", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Alexandre", email: "als.stumpf@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Uma vez", motivacao: "Interessado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Davi", email: "daviglf@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "João Luiz", email: "jluizmineiro@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "João Victor", email: "jvictorpa@outlook.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Iniciante", entrevistaInternacional: "Uma vez", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Adrianny", email: "adrianny.lelis@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Taiwan", email: "taiwanmaia2@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Cesar", email: "cesarcamillo2212@gmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Básico", entrevistaInternacional: "Primeira vez", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Igor", email: "icand32@gmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Intermediário", entrevistaInternacional: "Primeira vez", motivacao: "Curioso", faixaSalarial: "Até R$ 3.000" },
  { name: "Sayonnara", email: "sayonnaraaraujo@gmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Gabriel", email: "gabrielarcanjo.gap@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Guilherme", email: "guilhermes.b.dasilva@gmail.com", date: "2026-01-22", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Regularmente", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Leonardo", email: "leonardovarejo@gmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Primeira vez", motivacao: "Interessado", faixaSalarial: "Até R$ 3.000" },
  { name: "Camilla", email: "camillarayana@gmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Iniciante", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "João Victor", email: "domingos192192@gmail.com", date: "2026-01-22", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Intermediário", entrevistaInternacional: "Primeira vez", motivacao: "Interessado", faixaSalarial: "Até R$ 3.000" },
  { name: "Jose", email: "juniorpadua8@gmail.com", date: "2026-01-23", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Sueli", email: "s.horamoreira@gmail.com", date: "2026-01-23", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Primeira vez", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Evandro Neris", email: "evandroneris95@hotmail.co", date: "2026-01-23", tempoProgramador: "1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Guilherme", email: "gui081201@gmail.com", date: "2026-01-24", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "André", email: "andre.l.sales2706@gmail.com", date: "2026-01-24", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Erick", email: "erickmurakami.ehm@gmail.com", date: "2026-01-24", tempoProgramador: "Nunca", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Addison", email: "addisonmj59@gmail.com", date: "2026-01-24", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Thiago Silva", email: "thiagompta008@hotmail.com", date: "2026-01-24", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Marco", email: "marcoantonioloureiro098@gmail.com", date: "2026-01-25", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Thiago", email: "thiagommt2@gmail.com", date: "2026-01-25", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Interessado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Carlos", email: "carllos092@gmail.com", date: "2026-01-25", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Renan", email: "renan.renolds@gmail.com", date: "2026-01-25", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Nicolas Henrique", email: "nicolashenrique921@gmail.com", date: "2026-01-26", tempoProgramador: "Nunca", dominaLinguagem: "Aprendendo", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Felipe", email: "fscamposs@gmail.com", date: "2026-01-26", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Kauã", email: "kauazagocarrijo@gmail.com", date: "2026-01-26", tempoProgramador: "Estágio", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Giovani", email: "contato.giovanicf@gmail.com", date: "2026-01-26", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Básico", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Matheus", email: "matheus_manhaes@hotmail.com.br", date: "2026-01-26", tempoProgramador: "Nunca", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Lorena", email: "lorenagfcoelho@gmail.com", date: "2026-01-26", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Andre", email: "desmonplays@gmail.com", date: "2026-01-26", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Marllon", email: "marllonsostenes@gmail.com", date: "2026-01-26", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Intermediário", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Leandro", email: "leandrorampanelli@hotmail.com", date: "2026-01-26", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Básico", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "R$ 10.001 - R$ 15.000" },
  { name: "Pedro", email: "nathanpedro111@gmail.com", date: "2026-01-26", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Interessado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Alexis", email: "barragamalexis@gmail.com", date: "2026-01-26", tempoProgramador: "Estágio", dominaLinguagem: "Aprendendo", nivelIngles: "Não falo inglês", entrevistaInternacional: "Primeira vez", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Viviane", email: "vivyane-santos@hotmail.com", date: "2026-01-26", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Cauê", email: "cauerodriguesdev@gmail.com", date: "2026-01-27", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Algumas vezes", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Felipe", email: "feliperosik@gmail.com", date: "2026-01-27", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Primeira vez", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
  { name: "Camille", email: "camillepassoli16@gmail.com", date: "2026-01-27", tempoProgramador: "Nunca", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Yuri", email: "yuri4work@gmail.com", date: "2026-01-27", tempoProgramador: "Nunca", dominaLinguagem: "Aprendendo", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Degemar", email: "degemarpereira@gmail.com", date: "2026-01-27", tempoProgramador: "Nunca", dominaLinguagem: "Aprendendo", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Caio", email: "caio-cavalcanti@hotmail.com", date: "2026-01-27", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Acima de R$ 15.000" },
  { name: "Matheus", email: "imath.mariussi@gmail.com", date: "2026-01-27", tempoProgramador: "6 meses", dominaLinguagem: "Básico", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "João Guilherme", email: "jgorski.tech@gmail.com", date: "2026-01-27", tempoProgramador: "Nunca", dominaLinguagem: "Básico", nivelIngles: "Intermediário", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "Até R$ 3.000" },
  { name: "Lukas Gomes", email: "luk.devjobs@gmail.com", date: "2026-01-27", tempoProgramador: "1 ano", dominaLinguagem: "Aprendendo", nivelIngles: "Avançado/Fluente", entrevistaInternacional: "Sempre tive vontade", motivacao: "Muito motivado", faixaSalarial: "R$ 3.001 - R$ 6.000" },
  { name: "Johnny", email: "johnnyjns@gmail.com", date: "2026-01-27", tempoProgramador: "Mais de 1 ano", dominaLinguagem: "Domino bem", nivelIngles: "Básico", entrevistaInternacional: "Primeira vez", motivacao: "Muito motivado", faixaSalarial: "R$ 6.001 - R$ 10.000" },
];

export const surveyData: SurveyResponse[] = rawData.map((r, i) => ({
  ...r,
  id: i + 1,
  leadScore: calcScore(r),
}));

export type QuestionKey = keyof typeof questionLabels;
export const questionKeys: QuestionKey[] = [
  "tempoProgramador",
  "motivacao",
  "entrevistaInternacional",
  "nivelIngles",
  "dominaLinguagem",
  "faixaSalarial",
];
