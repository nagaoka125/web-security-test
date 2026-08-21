import { prisma } from "@/libs/prisma";
import { notFound } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { AboutView } from "@/app/_components/AboutView";
import { sanitizeHtml } from "@/app/_utils/sanitizeHtml";

// キャッシュを無効化して常に最新のプロフィールを取得
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const Page = async ({ params }: Props) => {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { aboutSlug: slug },
    select: {
      name: true,
      aboutContent: true,
    },
  });

  if (!user) {
    notFound();
  }

  const safeAboutContent = sanitizeHtml(user.aboutContent);

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faIdCard} className="mr-1.5" />
        {user.name} のプロフィール
      </div>

      <div className="mt-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
        <AboutView
          about={{
            userName: user.name,
            aboutSlug: slug,
            aboutContent: safeAboutContent,
          }}
        />
      </div>
    </main>
  );
};

export default Page;
