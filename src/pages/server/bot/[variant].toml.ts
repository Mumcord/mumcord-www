// One bot.toml per module mix for `curl` from the server configurator. No query string and no
// template: the setup replaces the key placeholders with fresh openssl keys on the server.
import type { APIRoute, GetStaticPaths } from "astro";
import { allVariants, botModules, botVariantId, buildBotToml, KEY_PLACEHOLDER, type ServerOptions, type CommentLang } from "../../../lib/compose";
import { getBotImageVersion } from "../../../lib/mumbot";

export const getStaticPaths: GetStaticPaths = async () => {
  const seen = new Map<string, { lang: CommentLang; options: ServerOptions }>();
  for (const v of allVariants(await getBotImageVersion()))
    for (const relayGuests of v.options.relay ? [false, true] : [false]) {
      const options = { ...v.options, relayGuests };
      if (botModules(options).length) seen.set(botVariantId(v.lang, options), { lang: v.lang, options });
    }
  return [...seen].map(([variant, props]) => ({ params: { variant }, props }));
};

export const GET: APIRoute = ({ props }) => {
  const { lang, options } = props as { lang: CommentLang; options: ServerOptions };
  return new Response(buildBotToml(lang, options, KEY_PLACEHOLDER), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
