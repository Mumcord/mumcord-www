// One compose file per feature mix for `curl` from the server configurator. Caddy fills in name,
// welcome text and numbers from the query string (templates in the Caddyfile); the rest is fixed here.
import type { APIRoute, GetStaticPaths } from "astro";
import { getImageVersions } from "../../../lib/images";
import { allVariants, buildCompose, type ServerOptions, type CommentLang } from "../../../lib/compose";
import { getBotImageVersion } from "../../../lib/mumbot";

export const getStaticPaths: GetStaticPaths = async () => {
  return allVariants(await getBotImageVersion(), (await getImageVersions()).mumpeer).map((v) => ({ params: { variant: v.id }, props: v }));
};

export const GET: APIRoute = ({ props }) => {
  const { lang, options } = props as { lang: CommentLang; options: ServerOptions };
  return new Response(buildCompose(lang, options, true), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
