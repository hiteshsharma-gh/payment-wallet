'use client'

import { useBalance } from "@repo/store";
import { Button } from "@repo/ui";

export default function IndexPage() {
  const balance = useBalance()

  return (
    <div>
      <h1 className="text-5xl text-red-500 font-bold" >Hello World</h1>
      <Button className="bg-red-400">Button</Button>
      <div>{balance}</div>
    </div>
  );
}
