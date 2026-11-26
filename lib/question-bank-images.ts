/** Only immutable, server-issued raster images; never arbitrary hosts or SVGs. */
export const IMAGE_ID =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
export const questionImagePath = (id: string) =>
  `/api/question-bank/images/${id}.webp`;
export function isQuestionImagePath(value: string) {
  const prefix = "/api/question-bank/images/";
  return (
    value.startsWith(prefix) &&
    value.endsWith(".webp") &&
    IMAGE_ID.test(value.slice(prefix.length, -5))
  );
}
