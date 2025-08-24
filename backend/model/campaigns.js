const { supabase } = require("../db/supabase");
const campaignsTable = "campaigns";

module.exports = {
async getAllCampaigns() {
        const { data, error } = await supabase
            .from(campaignsTable)
            .select('*')

        return data;
    },
}
