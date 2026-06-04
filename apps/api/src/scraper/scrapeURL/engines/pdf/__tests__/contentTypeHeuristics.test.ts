import { shouldRemovePdfFeatureForContentType } from "../pdfUtils";

describe("shouldRemovePdfFeatureForContentType", () => {
  it("does not remove PDF feature for application/pdf", () => {
    expect(shouldRemovePdfFeatureForContentType("application/pdf")).toBe(false);
  });

  it("does not remove PDF feature for application/pdf; charset=binary", () => {
    expect(shouldRemovePdfFeatureForContentType("application/pdf; charset=binary")).toBe(false);
  });

  it("does not remove PDF feature for application/octet-stream", () => {
    expect(shouldRemovePdfFeatureForContentType("application/octet-stream")).toBe(false);
  });

  it("removes PDF feature for text/html", () => {
    expect(shouldRemovePdfFeatureForContentType("text/html")).toBe(true);
  });

  it("removes PDF feature for text/html; charset=UTF-8", () => {
    expect(shouldRemovePdfFeatureForContentType("text/html; charset=UTF-8")).toBe(true);
  });

  it("removes PDF feature for application/xhtml+xml", () => {
    expect(shouldRemovePdfFeatureForContentType("application/xhtml+xml")).toBe(true);
  });

  it("removes PDF feature for text/plain", () => {
    expect(shouldRemovePdfFeatureForContentType("text/plain")).toBe(true);
  });

  it("does not remove when content type is missing", () => {
    expect(shouldRemovePdfFeatureForContentType(null)).toBe(false);
    expect(shouldRemovePdfFeatureForContentType(undefined)).toBe(false);
    expect(shouldRemovePdfFeatureForContentType("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(shouldRemovePdfFeatureForContentType("TEXT/HTML")).toBe(true);
    expect(shouldRemovePdfFeatureForContentType("Application/PDF")).toBe(false);
  });
});
