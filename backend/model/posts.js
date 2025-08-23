const { supabase } = require("../db/supabase");
const postTable = "post";

module.exports = {
  async getAllPosts() {
    const { data, error } = await supabase.from(postTable).select("*");
    if (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
    return data || [];
  },

  async createPost({ author, description, photo_url, created_at }) {
    const { data, error } = await supabase
      .from(postTable)
      .insert([{ author, description, photo_url, created_at }])
      .select();
    if (error) {
      console.error("Error creating post:", error);
      throw error;
    }
    console.log("created post details: ", data);
    return data;
  },
};
