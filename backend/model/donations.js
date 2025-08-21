const { supabase } = require("../db/supabase");
const donationsTable = "donations";

module.exports = {

    async getAllDonations() {
        const { data, error } = await supabase
            .from(donationsTable)
            .select('*')

        return data;
    },

}

