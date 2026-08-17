import { redirect } from "next/navigation";

export default function CreateRecipeRedirect() {
  redirect("/recipe/new");
}
