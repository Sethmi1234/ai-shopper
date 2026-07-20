import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerUser, getAuthUser } from "../../services/auth.service";
import { useCart } from "../../store/useCart";
import { useWishlist } from "../../store/useWishlist";

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: registerUser,

    onSuccess: async (data) => {
      // After registration, try to log in automatically
      // The register endpoint returns user data but no tokens,
      // so we need the user to log in separately.
      // We'll redirect to login with a success message.
      router.push("/login?registered=true");
    },
  });
};