////////////////////////////////
// Upload files to Cloudinary //
////////////////////////////////
import multer from 'multer'
import stream from 'stream'
import cloudinary from 'cloudinary'
import { Application, NextFunction, Request, Response } from 'express'


if (!process.env.CLOUDINARY_URL) {
    console.error('*******************************************************************************')
    console.error('*******************************************************************************\n')
    console.error('You must set the CLOUDINARY_URL environment variable for Cloudinary to function\n')
    console.error('\texport CLOUDINARY_URL="cloudinary:// get value from heroku"\n')
    console.error('*******************************************************************************')
    console.error('*******************************************************************************')
    process.exit(1)
}

export type CloudinaryRequest = Request & {fileurl?: string, fileid?: string};

const doUpload = (publicId: string, req: CloudinaryRequest , _res: Response, next: NextFunction) => {

	
	// multer can save the file locally if we want
	// instead of saving locally, we keep the file in memory
	// multer provides req.file and within that is the byte buffer
	
	// we create a passthrough stream to pipe the buffer
	// to the uploadStream function for cloudinary.
	if(!req.file)
	next()
	else{
		const uploadStream = cloudinary.v2.uploader.upload_stream({ public_id: req.body[publicId]}, (_err, result) => {    	
					 // capture the url and public_id and add to the request
					 req.fileurl = result!.url
					 req.fileid = result!.public_id
					 next()
		})
		const s = new stream.PassThrough()
		s.end(req.file.buffer)
		s.pipe(uploadStream)
		s.on('end', uploadStream.end)
		// and the end of the buffer we tell cloudinary to end the upload.
	}
}

// multer parses multipart form data.  Here we tell
// it to expect a single file upload named 'image'
// Read this function carefully so you understand
// what it is doing!
export const uploadImage = (publicId: string) => (req: Request, res: Response, next: NextFunction) =>
     multer().single('image')(req, res, () => 
               doUpload(publicId, req, res, next))

///////////////////////////////////////////////////////////////////////////////
// These three functions are examples to validate that uploading works
// You do not want them in your final application
// 
function postImage(req: CloudinaryRequest, res: Response) {
   // create an image tag from the cloudinary upload
   const image = cloudinary.v2.image(req.fileid!, {
       format: "png", width: 100, height: 130, crop: "fill" 
   })
   // create a response to the user's upload
   res.send(`Uploaded: ${req.fileurl} ${req.fileid}<br/><a href="${req.fileurl}">${image}</a>`);
}

function getImage(_req: Request, res: Response) {
	// This form has two parts: image and title
	// the title is used as the name of the uploaded file
	//   if not supplied, then we get some default name from Cloudinary
	// the image is the file to upload
	//   the name "image" must be the same as what we expect in the formData
	//   in the multer().single() middleware
	res.send('<form method="post" enctype="multipart/form-data">'
		+ '<p>Public ID: <input type="text" name="title"/></p>'
		+ '<p>Image: <input type="file" name="image"/></p>'
		+ '<p><input type="submit" value="Upload"/></p>'
		+ '</form>'
	);
}

export function setup(app: Application) {
	
	// this provides a form.  This is uneeded because
	// we have the upload on the frontend already.
    // but I provide it here for the inclass exercise example
	app.get('/image', getImage)

	// body-parser provides us the textual formData
	// which is just title in this case
	app.post('/image', uploadImage('title'), postImage)
}
// remove the above three functions and change the last line below to
//     module.exports = uploadImage
// 
// then to use in profile.js do (see comment in getImage about the string 'avatar')
//     const uploadImage = require('./uploadCloudinary')
//     app.put('/avatar', uploadImage('avatar'), uploadAvatar)
//
///////////////////////////////////////////////////////////////////////////////

