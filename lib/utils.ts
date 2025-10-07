import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function retryWithExponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
      // @ts-expect-error ts(1196)
    } catch (error: Error) {
      console.log(`Attempt ${attempt + 1} failed:`, error);
      if (error.status === 429 || error.message.includes("429")) {
        attempt++;
        const delay = baseDelay * 2 ** attempt;
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.warn(`Non-429 error:`, error);
        throw error;
      }
    }
  }
  throw new Error(`Max retries (${maxRetries}) exceeded.`);
}