// Aviso rápido no canto da tela, substituindo window.alert().
// Uso: toast("Convite enviado!")  ou  toast("Erro ao salvar", "erro")
// O <ToastHost /> (montado no App) escuta esse evento e exibe a mensagem.

export const TOAST_EVENT = "protransf:toast";

export function toast(texto, tipo = "sucesso") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { texto, tipo } }));
}
