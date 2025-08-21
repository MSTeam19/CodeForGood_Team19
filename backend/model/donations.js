const { supabase } = require("../db/supabase");
const donationsTable = "donations";

module.exports = {

    async getAllUsers() {
        const { data, error } = await supabase
            .from(donationsTable)
            .select('*')

        console.log(data)
        return data;
    },

}

