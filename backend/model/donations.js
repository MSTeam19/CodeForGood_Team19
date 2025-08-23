const { supabase } = require("../db/supabase");
const donationsTable = "donations";

module.exports = {

    async getAllDonations() {
        const { data, error } = await supabase
            .from(donationsTable)
            .select('*')

        return data;
    },

    async getAllDonationsWithMapping() {
        const { data, error } = await supabase
            .from(donationsTable)
            .select(`
                *,
                regions (
                    name
                ),
                campaigns (
                    name
                )
            `);

        if (error) throw new Error(error.message);

        return data;
    }
}

