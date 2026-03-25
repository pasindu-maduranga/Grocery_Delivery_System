const getHealth = async (req, res) => {
    try{
        res.status(200).json({ 
            status: "OK" 
        });
    }catch(err){
        console.log(err);
    }
}

module.exports = {getHealth};