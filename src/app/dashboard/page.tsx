import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listVideosByOwner } from "@/lib/db/videos";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadForm } from "@/components/dashboard/upload-form";
import { BrutalSection } from "@/components/ui/brutal-section";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const videos = await listVideosByOwner();
  const dateFormatter = new Intl.DateTimeFormat();

  return (
    <div className="min-h-screen p-8">
      <header className="mb-12 flex items-center justify-between border-b-[4px] border-black pb-4">
        <h1 className="font-black text-4xl uppercase tracking-tighter shadow-none">Dashboard</h1>
        <form action="/auth/signout" method="POST">
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>

      <BrutalSection heading="Upload video">
        <UploadForm />
      </BrutalSection>

      <BrutalSection heading="Your videos">
        {videos.length === 0 ? (
          <p className="text-black font-bold text-lg p-4 bg-white border-[4px] border-black inline-block">
            No videos yet. Upload one above.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <li key={v.id}>
                <Link href={`/dashboard/video/${v.id}`} className="block">
                  <Card className="transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-yellow h-full flex flex-col justify-between">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{v.title}</CardTitle>
                      <p className="text-sm font-bold mt-2 border-b-[2px] border-black pb-2">
                        {dateFormatter.format(new Date(v.created_at))} · {v.view_count} view{v.view_count !== 1 ? "s" : ""}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-block text-sm font-black uppercase tracking-widest text-white bg-black px-3 py-1 border-[2px] border-black mt-2">
                        Open →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </BrutalSection>
    </div>
  );
}
