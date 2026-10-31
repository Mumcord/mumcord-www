// One compose file per feature mix for `curl` from the server configurator. Caddy fills in name,
// welcome text and numbers from the query string (templates in the Caddyfile); the rest is fixed here.
import type { APIRoute, GetStaticPaths } from "astro";
import { allVariants, buildCompose, atLeast, MUMBOT_MODULES_FROM, type ServerOptions, type CommentLang } from "../../../lib/compose";
import { getMumbotVersion } from "../../../lib/mumbot";

export const getStaticPaths: GetStaticPaths = async () => {
  const version = await getMumbotVersion();
  // Music and history only once the Mumbot release that has them is out.
  const modules = atLeast(version, MUMBOT_MODULES_FROM);
  return allVariants(version)
    .filter((v) => modules || !(v.options.music || v.options.history))
    .map((v) => ({ params: { variant: v.id }, props: v }));
};

export const GET: APIRoute = ({ props }) => {
  const { lang, options } = props as { lang: CommentLang; options: ServerOptions };
  return new Response(buildCompose(lang, options, true), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
