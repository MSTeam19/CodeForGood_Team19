const { supabase } = require("../db/supabase");
const postTable = "post";

module.exports = {
  async getAllPosts() {
    const { data, error } = await supabase
      .from(postTable)
      .select("description, photo_url, created_at, author");

    if (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }

    return data;
  },
};
