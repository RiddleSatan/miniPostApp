import multer from "multer";
import crypto from 'crypto';
import path from "path";

const storage=multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'.public/images')
    },
    filename: function(req,res,cb){
        crypto.randomBytes(12,(err,bytes)=>{
            fn=bytes.toString('hex')+path.extname(file.orignalname)
            cb(null,fn)
        });
    }
});

export default multer({storage})