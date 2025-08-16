export default async function confirmDialog(message: string) {
  return new Promise<boolean>((res) => {
    const ok = window.confirm(message);
    res(ok);
  });
}
