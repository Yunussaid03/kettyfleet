import {redirect} from "next/navigation";


export default function Home() {             //Acts as dashboard redirect page
  redirect("/dashboard");
}
