import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;
let pullShieldCheckoutInterceptorInstalled = false;

function installPullShieldCheckoutInterceptor() {
  if (typeof window === "undefined" || pullShieldCheckoutInterceptorInstalled) return;
  pullShieldCheckoutInterceptorInstalled = true;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await nativeFetch(input, init);
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (response.status === 402 && /\/api\/trades\/\d+\/accept-offer(?:\?|$)/.test(url)) {
      try {
        const data = await response.clone().json();
        if (typeof data?.checkoutUrl === "string" && data.checkoutUrl.startsWith("https://")) {
          window.location.assign(data.checkoutUrl);
        }
      } catch {
        // Let the calling page display its normal API error if checkout data is invalid.
      }
    }
    return response;
  };
}

export function getSupabaseClient() {
  if (typeof window === "undefined") return null;
  installPullShieldCheckoutInterceptor();
  if (!supabaseClient) supabaseClient = createBrowserClient(supabaseUrl, supabaseKey);
  return supabaseClient;
}

/** Returns a fresh-enough access token for authenticated API requests. */
export async function getCurrentAccessToken() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  const expiresSoon = !session?.expires_at || session.expires_at * 1000 < Date.now() + 60_000;
  if (expiresSoon) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    return refreshed.session?.access_token ?? null;
  }
  return session.access_token;
}
