import { describe, expect, it } from "vitest";
import { calculateLeadScore, getLeadQualification } from "../packages/core/src/leadscore.js";

describe("leadscore weighted model (0-100)", () => {
  it("retorna 100 para perfil máximo", () => {
    const score = calculateLeadScore({
      experience: "Já faz mais de 1 ano que trabalho como programador",
      languageSkill: "Sim, domino bem uma ou mais linguagens",
      englishLevel: "Avançado/Fluente - consigo trabalhar normalmente",
      hasInternationalInterview: "Sim, já faço entrevistas gringas regularmente",
      internationalInterest:
        "Muito motivado(a) - é meu objetivo principal e estou disposto(a) a me preparar",
      salaryRange: "de R$ 6.000,00 até R$ 8.000,00 por mês (ou mais)"
    });
    expect(score).toBe(100);
    expect(getLeadQualification(score)).toBe("quente");
  });

  it("retorna score baixo para perfil inicial com sem interesse", () => {
    const score = calculateLeadScore({
      experience: "Nunca trabalhei",
      languageSkill: "Não, nunca programei",
      englishLevel: "Não falo inglês",
      hasInternationalInterview: "Não, é a primeira vez que penso nisso",
      internationalInterest: "Não tenho interesse - prefiro focar no mercado brasileiro",
      salaryRange: "Abaixo de R$ 2.000,00 por mês ou sem renda"
    });
    expect(score).toBe(1);
    expect(getLeadQualification(score)).toBe("frio");
  });

  it("classifica 40-79 como morno", () => {
    const score = calculateLeadScore({
      experience: "Só fiz estágio",
      languageSkill: "Sim, mas ainda estou aprendendo",
      englishLevel: "Intermediário - me viro bem no trabalho",
      hasInternationalInterview: "Não, mas sempre tive vontade",
      internationalInterest: "Interessado(a) - vejo muito valor e quero me preparar melhor",
      salaryRange: "de R$ 2.000,00 até R$ 4.000,00 por mês"
    });

    expect(score).toBeGreaterThanOrEqual(40);
    expect(score).toBeLessThan(80);
    expect(getLeadQualification(score)).toBe("morno");
  });
});
