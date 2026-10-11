import { describe, expect, it } from "vitest";
import { formatDocumentNumber, timestampCode } from "../src/lib/documentNumber.js";

describe("documentNumber", () => {
  const date = new Date(2026, 9, 8, 9, 5, 7);

  it("arma el código con fecha y hora", () => {
    expect(timestampCode(date)).toBe("20261008-090507");
  });

  it("agrega un sufijo cuando ya hay documentos en el mismo segundo", () => {
    expect(formatDocumentNumber("VTA", date, 0)).toBe("VTA-20261008-090507");
    expect(formatDocumentNumber("VTA", date, 1)).toBe("VTA-20261008-090507-2");
  });
});
