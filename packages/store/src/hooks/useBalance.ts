import { useRecoilValue } from "recoil"
import { balanceAtom } from "../atoms/balance"

export const useBalance = () => {
  const balance = useRecoilValue(balanceAtom)
  console.log(balance)
  return balance
}
