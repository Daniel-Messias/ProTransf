// Comprime uma imagem no navegador e devolve um data URL JPEG.
//
// As fotos ficam salvas direto no documento do Firestore (o Firebase Storage
// exige o plano Blaze). Um documento do Firestore tem limite de 1 MiB, então
// a imagem precisa ser pequena: reduzimos o lado maior e baixamos a qualidade
// até caber em `maxBytes`.

export const PRESET_AVATAR = { maxLado: 320, maxBytes: 60 * 1024 };
export const PRESET_PRINT_ESTATISTICA = { maxLado: 1400, maxBytes: 450 * 1024 };

function carregarImagem(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler essa imagem. Tente outro arquivo (JPG ou PNG)."));
    };
    img.src = url;
  });
}

// tamanho aproximado em bytes de um data URL base64
function bytesDoDataUrl(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
}

export async function comprimirImagem(file, { maxLado, maxBytes }) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Escolha um arquivo de imagem.");
  }

  const img = await carregarImagem(file);
  let lado = maxLado;

  // até 6 tentativas: baixa a qualidade e, se não bastar, o tamanho
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const escala = Math.min(1, lado / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);

    const ctx = canvas.getContext("2d");
    // fundo branco: PNG transparente vira preto no JPEG sem isso
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const qualidade of [0.85, 0.72, 0.6]) {
      const dataUrl = canvas.toDataURL("image/jpeg", qualidade);
      if (bytesDoDataUrl(dataUrl) <= maxBytes) return dataUrl;
    }
    lado = Math.round(lado * 0.75);
  }

  throw new Error("Imagem grande demais. Tente uma foto menor.");
}
