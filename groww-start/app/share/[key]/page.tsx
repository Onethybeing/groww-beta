import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ShareActions } from "@/components/share/share-actions";
import { cardLines, parseShareParams } from "@/lib/share";

type Props = { params: Promise<{ key: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function build({ params, searchParams }: Props) {
  const { key } = await params;
  const raw = await searchParams;
  const sp = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const stats = parseShareParams(sp, key);
  const q = new URLSearchParams({ m: key, streak: String(stats.streak), lessons: String(stats.lessons) });
  if (stats.persona) q.set("persona", stats.persona);
  return { imgUrl: `/api/card?${q.toString()}`, lines: cardLines(stats) };
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { imgUrl, lines } = await build(props);
  return {
    title: `${lines.headline} · GROW Beta`,
    openGraph: { title: lines.headline, description: lines.sub, images: [{ url: imgUrl, width: 1080, height: 1920 }] },
  };
}

export default async function SharePage(props: Props) {
  const { imgUrl, lines } = await build(props);
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <PageHeader title="Share your milestone" back="/holdings" />
      <main className="flex flex-1 flex-col items-center gap-3.5 px-5 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-testid="share-card" src={imgUrl} alt={`Story card: ${lines.headline}`} width={1080} height={1920}
          className="h-auto w-[270px] rounded-[22px] shadow-[0_16px_40px_rgba(11,122,85,0.3)]" />
        <p className="text-center text-[13px] text-muted-ink">Your card shows habits only, never amounts or returns.</p>
      </main>
      <footer className="px-5 pb-[22px] pt-3">
        <ShareActions imgUrl={imgUrl} text={`${lines.headline}! Building my investing habit on GROW Beta.`} />
      </footer>
    </div>
  );
}
