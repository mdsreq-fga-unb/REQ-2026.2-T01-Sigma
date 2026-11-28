/*
 * Gera um PDF mínimo (uma página, texto simples) para o mock: arquivos de exemplo dos
 * documentos anexados e PDFs das fichas preenchidas. Não substitui o PDF real do backend.
 */

/** Mantém só caracteres Latin-1 (WinAnsi) e escapa os delimitadores de string do PDF. */
function textoPdf(texto: string): string {
  return texto
    .replace(/[—–]/g, "-")
    .replace(/[^\x20-\xff]/g, "?")
    .replace(/[\\()]/g, (c) => `\\${c}`);
}

export function gerarPdfSimples(titulo: string, linhas: string[] = []): Uint8Array<ArrayBuffer> {
  const conteudo = [
    "BT",
    "/F1 18 Tf",
    "60 780 Td",
    `(${textoPdf(titulo)}) Tj`,
    "/F1 11 Tf",
    "0 -28 Td",
    ...linhas.flatMap((linha) => [`(${textoPdf(linha)}) Tj`, "0 -16 Td"]),
    "ET",
  ].join("\n");

  const objetos = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];

  // Todo o texto é Latin-1, então cada caractere ocupa um byte e os offsets do xref batem.
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objetos.forEach((objeto, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const inicioXref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;

  const bytes = new Uint8Array(new ArrayBuffer(pdf.length));
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i);
  return bytes;
}

/** Cabeçalho `Content-Disposition` com o nome original (inclusive acentos). */
export function contentDisposition(nomeArquivo: string): string {
  const ascii = nomeArquivo.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(nomeArquivo)}`;
}
