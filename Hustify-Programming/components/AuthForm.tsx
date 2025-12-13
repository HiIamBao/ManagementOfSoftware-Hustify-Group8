"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import { getAllCompanyNames } from "@/lib/actions/company.action";
import FormField from "./FormField";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),
    userRole: type === "sign-up" ? z.enum(["normal", "hr"]) : z.string().optional(),
    companyId: type === "sign-up" ? z.string().optional() : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"normal" | "hr">("normal");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (type === 'sign-up') {
        const result = await getAllCompanyNames();
        if (result.success) {
          setCompanies(result.companies);
        }
      }
    };
    fetchCompanies();
  }, [type]);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      userRole: "normal",
      companyId: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password, userRole, companyId } = data;

        if (userRole === "hr" && !companyId) {
          toast.error("Company selection is required for HR users");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
          userRole: userRole || "normal",
          companyId: userRole === "hr" ? companyId : undefined,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        const { email, password } = data;

        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        const result = await signIn({
          email,
          idToken,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Signed in successfully.");
        router.refresh();
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px] mt-10 mb-10">
      <div className="flex flex-col gap-2 bg-gray-100 dark:bg-[#2c2c2c] py-6 px-10 rounded-2xl">
        <div className="flex flex-row gap-1 justify-center">
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              <Image
              src="/ai-avatar.png"
              alt="logo"
              width={280}
              height={90}
              className="object-contain"
              />
            </div>
          </Link>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 form"
          >
            {!isSignIn && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  label="Name"
                  placeholder="Your Name"
                  type="text"
                />

                <div className="space-y-3">
                  <label className="text-sm font-medium">Account Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="normal"
                        checked={selectedRole === "normal"}
                        onChange={(e) => {
                          setSelectedRole(e.target.value as "normal" | "hr");
                          form.setValue("userRole", "normal");
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Normal User</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="hr"
                        checked={selectedRole === "hr"}
                        onChange={(e) => {
                          setSelectedRole(e.target.value as "normal" | "hr");
                          form.setValue("userRole", "hr");
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">HR Recruiter</span>
                    </label>
                  </div>
                </div>

                {selectedRole === "hr" && (
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="companyId"
                      label="Select Your Company"
                      type="combobox"
                      placeholder="Select a company..."
                      options={companies.map(c => ({ label: c.name, value: c.id }))}
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Don't see your company?{" "}
                      <Link href="/company/register" className="text-[#BF3131] hover:underline">
                        Register it here
                      </Link>
                    </p>
                  </div>
                )}
              </>
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
