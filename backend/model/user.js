const { supabase } = require("../db/supabase");
const userTable = "user";

module.exports = {

    async getAllUsers() {
        const { data, error } = await supabase
            .from(userTable)
            .select('*')

        return data;
    },

    async getUserByEmail(email) {
        const { data, error } = await supabase
            .from(userTable)
            .select('*')
            .eq('email', email)
            .single();
        if (error || !data) return null;
        return data;
    },

    async createUser(email, name, password) {
        const { data, error } = await supabase
            .from(userTable)
            .insert([{ email, name, password }])
            .select('*')
            .single();

        if (error) throw new Error(error.message);
        return data;
    },
}

