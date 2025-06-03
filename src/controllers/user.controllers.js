import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/User.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefereshToken = async(userId) =>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch(error){
        throw new ApiError(500,"Something went wrong while genrating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })

    // step for register user
    // 1.get user details from frontend
    // 2.validation - not empty or email or usrename should me unique 
    // 3.check if user already exists: username ,email
    // 4.check images , check for avatar
    // 5.upload them to clodinary,avatar
    // 6.create user in database
    // 7.remove password and refresh token field from response
    // 8.check for user creation
    // 9.return res
  
     const {fullname,email,username,password} = req.body
     console.log(fullname,email,username);
  
    if([fullname,email,username,password].some((field)=>
    field?.trim() ==="")){
        throw new ApiError(400,"All fields are required")
    }
          
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"Username or Email already exists")
    }
    console.log("req ki field values",req.field);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const converImageLocalPath = req.files?.converImage[0]?.path;

    let converImageLocalPath;
    if(req.files && Array.isArray(req.files.converImage) && req.files.converImage.length >0){
        converImageLocalPath = req.files.converImage[0].path
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    const converImage = await uploadOnCloudinary(converImageLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    const user= await User.create({
        fullname,
        avatar:avatar.url,
        converImage:converImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createUser= await User.findById(user._id).select(
        "-password -refreshToken"               
    )  // This line is fetching a user from the database by ID, but excluding sensitive fields like the password and refresh token.

    if(!createUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    return res.status(201).json(
         new ApiResponse(200,createUser,"User registered successfully")
    )

}) 

//=========================================

    // login steps  :
   // req body se data get from frontend/postman
   // username or email
    // find the user
    // password check
    // access or refresh token
    // send cookie


   const loginUser = asyncHandler(async(req,res)=>{


    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }
    const user= await User.findOne({
        $or :[{username},{email}]
    }) // Find ONE user in the database where EITHER the email OR the username matches the given values.


    if(!user){
        throw new ApiError(404,"User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404,"Invailid user credentials")
    }
     
   const {accessToken,refreshToken}=  await generateAccessAndRefereshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options ={
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure:true  // Ensures the cookie is only sent over HTTPS connections.
   }         
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
    new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user logged In successfully")
   )
})


// logout logic

const logoutUser = asyncHandler(async (req,res)=>{
await User.findByIdAndUpdate( req.user._id,{$set:{refreshToken:undefined}},{new:true})

const options={
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure:true  // Ensures the cookie is only sent over HTTPS connections.
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,"User logged out successfully"))
})


// refresh token logic
const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401,"Invalid refresh token ( unauthorized request)")
    }

   try{
     const decodedToken= jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )
     
    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"invalid refresh token")
    }

    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }
    const options ={
        httpOnly:true,
        secure:true
    }
   const {accessToken,newrefreshToken}= await generateAccessAndRefereshToken(user._id)

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",newrefreshToken,options)
   .json(new ApiError(200,{accessToken,refreshToken:newrefreshToken},"Access token refreshed"))
   
   }
   catch(error){
    throw new ApiError(401,error?.message || "Invalid refresh token")
   }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}