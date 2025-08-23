const { supabase } = require("../db/supabase");
const postTable = "post";

module.exports = {
  async getAllPosts() {
    const { data, error } = await supabase.from(postTable).select("*");

    if (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }

    return data;
  },

  async createPost({ author, description, photo_url }) {
    const { data, error } = await supabase
      .from(postTable)
      .insert([{ author, description, photo_url }]);
    if (error) {
      console.error("Error creating post:", error);
      throw error;
    }
    return data;
  },
};
