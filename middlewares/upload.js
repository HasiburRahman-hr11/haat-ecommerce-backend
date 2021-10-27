const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null , 'public/uploads/media');
    },
    filename : (req,file,cb)=>{
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname );
    }
});

const upload = multer({
    storage : storage,
    fileFilter: (req,file,cb)=>{
        let types = /jpeg|jpg|png|gif/
        let extName = types.test(path.extname(file.originalname).toLowerCase());
        let mimeType = types.test(file.mimetype);

        if(extName && mimeType){
            cb(null , true)
        }else{
            cb(new Error('Supports only image!'))
        }
    }
});

module.exports = upload;
