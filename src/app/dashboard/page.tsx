import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listVideosByOwner } from "@/lib/db/videos";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadForm } from "@/components/dashboard/upload-form";

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
      <header className="mb-8 flex items-center justify-between border-b-2 border-charcoal pb-4">
        <h1 className="font-serif text-2xl font-light">Dashboard</h1>
        <form action="/auth/signout" method="POST">
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 font-serif text-lg font-light">Upload video</h2>
        <UploadForm />
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-light">Your videos</h2>
        {videos.length === 0 ? (
          <p className="text-pewter">No videos yet. Upload one above.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <li key={v.id}>
                <Link href={`/dashboard/video/${v.id}`}>
                  <Card className="transition-shadow hover:shadow-[6px_6px_0_0_theme(colors.charcoal)]">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{v.title}</CardTitle>
                      <p className="text-sm text-pewter">
                        {dateFormatter.format(new Date(v.created_at))} · {v.view_count} view{v.view_count !== 1 ? "s" : ""}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm font-semibold uppercase tracking-wider text-oxblood">
                        Open →
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
