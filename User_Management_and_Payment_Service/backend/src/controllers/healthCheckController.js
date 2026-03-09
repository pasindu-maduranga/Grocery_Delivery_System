const getHealth = async (req, res) => {
    try{
        res.status(200).json({ 
            status: "O" 
        });
    }catch(err){
        console.log(err);
    }
}

module.exports = {getHealth};