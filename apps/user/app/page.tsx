import { prisma } from "@repo/db";
import { Button } from "@repo/ui";

export default async function IndexPage() {
  const users = await prisma.user.findMany();

  return (
    <div>
      <h1 className="text-5xl text-red-500 font-bold" >Hello World</h1>
      <Button className="bg-red-400">Button</Button>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
