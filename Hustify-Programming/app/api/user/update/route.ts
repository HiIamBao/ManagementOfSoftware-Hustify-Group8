import { db } from "@/firebase/admin";

export async function POST(req: Request) {
  try {
    const { id, description, name, coverimg, image, phone, birthday, address, darkmode, skills, experiences, education, projects } = await req.json();
    //console.log({ id, skills });

    if (!id) {
      return new Response("Missing user id", { status: 400 });
    }

    await db
      .collection("users")
      .doc(id)
      .update({
      ...(description !== undefined ? { description } : {}),
      ...(name !== undefined ? { name } : {}),
      ...(image !== undefined ? { image } : {}),
      ...(coverimg !== undefined ? { coverimg } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(birthday !== undefined ? { birthday } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(skills !== undefined ? { skills } : {}),
      ...(darkmode !== undefined ? { darkmode } : {}),
      ...(education !== undefined ? { education } : {}),
      ...(experiences !== undefined ? { experiences } : {}),
      ...(projects !== undefined ? { projects } : {}),
      });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Error updating user", { status: 500 });
  }
}
