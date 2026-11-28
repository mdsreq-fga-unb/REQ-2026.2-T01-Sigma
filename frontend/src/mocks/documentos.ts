import type { NextRequest, NextResponse } from "next/server";
import { TAMANHO_MAXIMO_BYTES, TAMANHO_MAXIMO_MB, arquivoEhPdf } from "@/lib/documentos";
import { erro } from "./store";

/*
 * UC05 – leitura e validação do upload (`multipart/form-data`) nas rotas de documentos do mock.
 * Reproduz as validações esperadas do backend: só PDF (RN05) e tamanho máximo.
 */

export interface Upload {
  arquivo: File;
  conteudo: Uint8Array<ArrayBuffer>;
  /** Campo `tipo` do formulário (só no anexar). */
  tipo: FormDataEntryValue | null;
}

/** Os PDFs começam com "%PDF-". */
function assinaturaPdf(bytes: Uint8Array): boolean {
  return [0x25, 0x50, 0x44, 0x46, 0x2d].every((byte, i) => bytes[i] === byte);
}

export async function lerUpload(request: NextRequest): Promise<{ upload: Upload } | { resposta: NextResponse }> {
  const form = await request.formData().catch(() => null);
  const arquivo = form?.get("arquivo");
  if (!form || !(arquivo instanceof File) || arquivo.size === 0) {
    return { resposta: erro(422, "DADOS_INVALIDOS", "Selecione um arquivo PDF.") };
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return {
      resposta: erro(413, "ARQUIVO_MUITO_GRANDE", `O arquivo excede o tamanho máximo de ${TAMANHO_MAXIMO_MB} MB.`),
    };
  }
  const conteudo = new Uint8Array(await arquivo.arrayBuffer());
  if (!arquivoEhPdf(arquivo) || !assinaturaPdf(conteudo)) {
    return { resposta: erro(415, "FORMATO_INVALIDO", "Formato de arquivo inválido. Envie um arquivo PDF.") };
  }
  return { upload: { arquivo, conteudo, tipo: form.get("tipo") } };
}
