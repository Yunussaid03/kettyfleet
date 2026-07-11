import { supabase } from "./client";

async function testConnection() {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*");

  console.log(data);
  console.log(error);
}

testConnection();