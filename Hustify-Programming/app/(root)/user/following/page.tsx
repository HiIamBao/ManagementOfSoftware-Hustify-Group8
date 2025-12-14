import { getCurrentUser } from "@/lib/actions/auth.action";
import { getCompanyById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import FollowButton from "@/components/company/FollowButton";
import { Company } from "@/types";

export default async function FollowingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const followingCompanies = await Promise.all(
    (user.followingCompanies || []).map(id => getCompanyById(id))
  );

  const validCompanies = followingCompanies.filter(c => c !== null) as Company[];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Companies You Follow</h1>
      
      {validCompanies.length > 0 ? (
        <div className="space-y-4">
          {validCompanies.map(company => (
            <div key={company.id} className="bg-white dark:bg-[#121212] rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <Link href={`/company/${company.id}`} className="flex items-center gap-4 group">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={company.logo || "/placeholder-logo.png"}
                    alt={`${company.name} logo`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold group-hover:text-[#BF3131]">{company.name}</h2>
                  <p className="text-sm text-gray-500">{company.industry || "Industry not specified"}</p>
                </div>
              </Link>
              <FollowButton 
                companyId={company.id}
                isFollowing={true} // They are following, so the button will show "Unfollow"
                isLoggedIn={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#121212] rounded-lg border border-dashed">
          <p className="text-gray-600 dark:text-gray-400">You are not following any companies yet.</p>
          <Link href="/jobs" className="text-[#BF3131] hover:underline mt-2 inline-block">Explore jobs and companies</Link>
        </div>
      )}
    </div>
  );
}

