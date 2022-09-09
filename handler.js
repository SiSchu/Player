const fs = require("fs")


module.exports = {

    getfiles: function(directoryname){
        let filenames = fs.readdirSync(directoryname)
        return filenames
    }
}