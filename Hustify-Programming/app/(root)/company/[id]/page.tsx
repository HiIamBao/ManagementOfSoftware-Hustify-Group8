import { getCompanyById, getJobsByCompanyId } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { notFound } from "next/navigation";
import Image from "next/image";
import FollowButton from "@/components/company/FollowButton";
import CompanyProfileTabs from "@/components/company/CompanyProfileTabs";

interface CompanyPageProps {
  params: { id: string };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const company = await getCompanyById(params.id);
  const user = await getCurrentUser();

  if (!company) {
    notFound();
  }

  const jobs = await getJobsByCompanyId(params.id);
  const isFollowing = user ? (user.followingCompanies || []).includes(company.id) : false;
  const isLoggedIn = !!user;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-[-64px]">
        <Image
          src={company.coverimg || "/placeholder-cover.jpg"}
          alt={`${company.name} cover image`}
          layout="fill"
          objectFit="cover"
          className="bg-gray-200"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="relative bg-white dark:bg-[#121212] rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-[#121212] flex-shrink-0 -mt-24 shadow-md overflow-hidden">
            <Image
              src={company.logo || "/placeholder-logo.png"}
              alt={`${company.name} logo`}
              width={128}
              height={128}
              className="object-contain"
            />
          </div>
          <div className="flex-1 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{company.industry || "Industry not specified"}</p>
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#BF3131] hover:underline mt-1 block">
                    {company.website}
                  </a>
                )}
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-center">
                <FollowButton
                  companyId={company.id}
                  isFollowing={isFollowing}
                  isLoggedIn={isLoggedIn}
                />
                <p className="text-sm text-gray-500 mt-2">{company.followerCount || 0} followers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <CompanyProfileTabs description={company.description} jobs={jobs} />
        </div>
      </div>
    </div>
  );
}

