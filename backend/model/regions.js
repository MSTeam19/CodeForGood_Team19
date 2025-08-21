const { supabase } = require("../db/supabase");
const regionsTable = "regions";

module.exports = {

    async getAllUsers() {
        const { data, error } = await supabase
            .from(regionsTable)
            .select('*')

        console.log(data)
        return data;
    },

}

