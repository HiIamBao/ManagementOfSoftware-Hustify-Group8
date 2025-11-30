import { getCompanyById } from "@/lib/actions/general.action";
import CompanyProfileHeader from "@/components/CompanyProfileHeader";
import CompanyInfoBox from "@/components/CompanyInfoBox";
import CompanyLeaders from "@/components/CompanyLeaders";
import CompanySpotlight from "@/components/CompanySpotlight";
import CompanyFields from "@/components/CompanyFields";
import React from "react";

interface CompanyPageProps {
  params: { id: string };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const company = await getCompanyById(params.id);

  if (!company) {
    return <div className="p-8">Company not found.</div>;
  }

  return (
    <section className="card-cta blue-gradient dark:red-gradient-dark flex flex-col items-center">
      {/* Thông tin công ty */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col gap-6">
          {/* Ảnh nền, logo, tên công ty */}
          <CompanyProfileHeader company={company} />
        </div>
        {/* Thông tin chi tiết công ty */}
        <div className="space-y-2">
          <CompanyInfoBox company={company} />
        </div>
      </div>

      {/* 3 article nằm dưới, luôn full width và responsive */}
      <div className="w-full max-w-4xl flex flex-col gap-6 mt-10">
        {/* Leaders */}
        <CompanyLeaders company={company} />
        {/* Spotlight */}
        <CompanySpotlight company={company} />
        {/* Fields */}
        <CompanyFields company={company} />
      </div>
    </section>
  );
}