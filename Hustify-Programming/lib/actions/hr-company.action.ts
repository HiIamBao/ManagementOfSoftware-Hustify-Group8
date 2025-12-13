"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { UpdateCompanyParams } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * Update the current HR user's company profile
 */
export async function updateCompanyProfile(params: UpdateCompanyParams) {
  try {
    const user = await getCurrentUser();
    if (!user || user.userRole !== "hr") {
      return {
        success: false,
        message: "Only HR users can update company profiles",
      };
    }

    if (!user.companyId) {
      return {
        success: false,
        message: "HR user is not associated with a company",
      };
    }

    const companyRef = db.collection("companies").doc(user.companyId);
    const companyDoc = await companyRef.get();

    if (!companyDoc.exists) {
      return { success: false, message: "Company not found" };
    }

    const updateData = {
      ...params,
      updatedAt: new Date().toISOString(),
    };

    await companyRef.update(updateData);

    // Revalidate the public company page and the HR edit page
    revalidatePath(`/company/${user.companyId}`);
    revalidatePath(`/hr/company/edit`);

    return {
      success: true,
      message: "Company profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating company profile:", error);
    return {
      success: false,
      message: "Failed to update company profile",
    };
  }
}

