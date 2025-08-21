const { supabase } = require("../db/supabase");
const regionsTable = "regions";

module.exports = {

    async getAllRegions() {
        const { data, error } = await supabase
            .from(regionsTable)
            .select('*')

        return data;
    },

}

