import bcryptjs from "bcryptjs";
const { hashSync, genSaltSync, compareSync } = bcryptjs;
import { sendError, sendSuccess } from "../utils/responses.js";
import { v4 as uuidv4 } from "uuid";
import {
  ALREADYEXISTS,
  BADREQUEST,
  CREATED,
  FORBIDDEN,
  INTERNALERROR,
  NOTFOUND,
  OK,
  UNAUTHORIZED,
} from "../constants/httpStatus.js";
import nodemailer from "nodemailer";
// import Users from '../models/register.js';
// import { PENDING } from '../constants/constants.js';
import { responseMessages } from "../constants/responseMessages.js";
import Users from "../models/Users.js";
import { GenerateToken, ValidateToken, VerifyToken } from "../helpers/token.js";
import pkg from "jsonwebtoken";
import { sendEmailOTP } from "../helpers/emailer.js";

import jsonwebtoken from "jsonwebtoken";
import { uploadImageToCloudinary } from "../utils/helper.js";
const { sign, verify, decode } = jsonwebtoken;

// const {
//
//
//
//
//
//     GET_SUCCESS_MESSAGES,
//     INVITATION_LINK_UNSUCCESS,
//     MISSING_FIELDS,
//     MISSING_FIELD_EMAIL,
//     NO_USER,
//     NO_USER_FOUND,
//     PASSWORD_AND_CONFIRM_NO_MATCH,
//     PASSWORD_CHANGE,
//     PASSWORD_FAILED,
//     RESET_LINK_SUCCESS,
//     SUCCESS_REGISTRATION,
//     UN_AUTHORIZED,
//     USER_EXISTS,
//     USER_NAME_EXISTS
// } = responseMessages;

// @desc    SIGNUP
// @route   POST api/auth/signup
// @access  Public

// export const signUp = async (req, res) => {
//   console.log("signup controller");
//   console.log(req.body, "===>>> req.body");

//   try {
//     const { userName, email, password, role, phone, address } = req.body;

//     if (!userName || !email || !password || !role || !phone || !address) {
//       return res
//         .status(BADREQUEST) //BADREQUEST
//         .send(
//           sendError({ status: false, message: responseMessages.MISSING_FIELDS })
//         );
//       // .send("Missing Fields");
//     }
//     // const salt = genSaltSync(10);
//     // const hashedPassword = hashSync(password, salt)
//     // return res.send(hashedPassword)

//     const user = await Users.findOne({ email: email });

//     console.log(user, "====>> user");
//     if (user) {
//       return res
//         .status(ALREADYEXISTS)
//         .send(
//           sendError({ status: false, message: responseMessages.USER_EXISTS })
//         );
//     } else {
//       const user = await Users.findOne({ userName: userName });
//       if (user) {
//         return res.status(ALREADYEXISTS).send(
//           sendError({
//             status: false,
//             message: responseMessages.USER_NAME_EXISTS,
//           })
//         );
//       } else {
//         const salt = genSaltSync(10);
//         let doc;

//         if (password?.length >= 6) {
//           doc = new Users({
//             userName: userName,
//             email: email,
//             password: hashSync(password, salt),
//             role: role,
//             phone: phone,
//             address: address,
//           });
//           //otp
//           const otp = uuidv4().slice(0, 6);
//           console.log(otp, "==>> otp ban gaya");
//           doc.otp = otp;
//           doc.expiresIn = Date.now() + 60000; // OTP expires in 10 minutes
//           let savedUser = await doc.save();
//           if (savedUser.errors) {
//             return res
//               .status(INTERNALERROR)
//               .send(
//                 sendError({ status: false, message: error.message, error })
//               );
//           } else {
//             // return res.send(savedUser);
//             savedUser.Password = undefined;
//             const token = GenerateToken({
//               data: savedUser?._id,
//               expiresIn: "24h",
//             });

//             // sendEmail()
//             const emailResponse = await sendEmailOTP(email, otp);

//             return res.status(CREATED).send(
//               sendSuccess({
//                 status: true,
//                 message: responseMessages.SUCCESS_REGISTRATION,
//                 token,
//                 data: savedUser,
//               })
//             );
//           }
//         } else {
//           return res.status(FORBIDDEN).send(
//             sendError({
//               status: false,
//               message: responseMessages.UN_AUTHORIZED,
//             })
//           );
//         }
//       }
//     }
//   } catch (error) {
//     // console.log(error.message, "====>>>error")
//     return (
//       res
//         .status(500) //INTERNALERROR
//         // .send(sendError({ status: false, message: error.message, error }));
//         .send(error.message)
//     );
//   }
// };

// isUserLoggedIn
// @desc    IS USER LOGGED IN
// @route   GET api/auth/isuserloggedin
// @access  Private
export const isUserLoggedIn = async (req, res) => {
  try {
    const userData = req.user;
    if (userData) {
      console.log(userData, "====>> userData");
      return res.status(200).json({
        status: true,
        message: "User is logged in",
        data: userData,
      });
    } else {
      console.log("User is not logged in");
    }
  } catch (error) {
    return res
      .status(500) //INTERNALERROR
      .send(error.message);
  }
};

// singup
// @desc    REGISTER USER
// @route   POST api/auth/signup
// @access  Public
export const signUp = async (req, res) => {
  console.log(req.body, "===>>> req.body");
  try {
    const { name, email, password, img } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: "Please provide all required fields",
        })
      );
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: "Password must be at least 6 characters long",
        })
      );
    }

    // Check if username already exists
    const existingName = await Users.findOne({ name });
    if (existingName) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: "Name already exists",
        })
      );
    }

    // Check if email already exists
    const existingEmail = await Users.findOne({ email });
    if (existingEmail) {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: "Email already exists",
        })
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Upload image to Cloudinary if img is provided
    let imageUrl = "";
    if (img) {
      const uploadImg = await uploadImageToCloudinary(img);
      imageUrl = uploadImg?.url;
    }

    // Create new user
    const newUser = new Users({
      name,
      email,
      password: hashedPassword,
      img: imageUrl,
    });

    console.log(newUser, "====>> newUser");

    // Save user
    const savedUser = await newUser.save();

    // Remove password from response
    savedUser.password = undefined;

    return res.status(CREATED).send(
      sendSuccess({
        status: true,
        message: "Registration successful.",
        data: savedUser,
      })
    );
  } catch (error) {
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        error,
      })
    );
  }
};

// @desc    LOGIN
// @route   GET api/auth/login
// @access  Public

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      let user = await Users.findOne({ email: email });
      if (user) {
        const isValid = compareSync(password, user.password);
        if (user.email === email && isValid) {
          user.password = undefined;
          const token = GenerateToken({ data: user?._id, expiresIn: "24h" });
          res.status(OK).send(
            sendSuccess({
              status: true,
              message: "Login Successfull",
              token,
              data: user,
            })
          );
        } else {
          return res.status(OK).send(
            sendError({
              status: false,
              message: responseMessages.UN_AUTHORIZED,
            })
          );
        }
      } else {
        return res
          .status(NOTFOUND)
          .send(
            sendError({ status: false, message: responseMessages.NO_USER })
          );
      }
    } else {
      return (
        res
          .status(500) //BADREQUEST
          // .send(sendError({ status: false, message: MISSING_FIELDS }));
          .send("Missing fields")
      );
    }
  } catch (error) {
    return res
      .status(500) 
      .send(error.message);
  }
};

// @desc    forgotPasswordEmail
// @route   GET api/auth/forgotPasswordEmail
// @access  Public

export const forgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await Users.findOne({
        Email: email,
      });
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        // console.log(user, "===>> user")
        // console.log(user._id, "===>> userId")
        // console.log(process.env.JWT_SECRET_KEY, "===>> secretKey")
        const token = GenerateToken({ data: secret, expiresIn: "30m" });
        // return res.send(token)
        const link = `${process.env.WEB_LINK}/api/auth/resetPassword/${user._id}/${token}`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });

        // const transporter = nodemailer.createTransport({
        //     host: process.env.MAILTRAPHOST,
        //     port: process.env.MAILTRAPPORT,
        //     auth: {
        //         user: process.env.MAILTRAPUSERNAME,
        //         pass: process.env.MAILTRAPPASSWORD,
        //     },
        // });

        const mailOptions = {
          from: "innosufiyan@gmail.com", //email jis se bhejni ho
          to: "innosufiyan@gmail.com", //jisko email bhejni ho
          subject: "Reset Password",
          text: `Please click on the link to reset your password ${link}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res
              .status(INTERNALERROR)
              .send(sendError({ status: false, message: error.message }));
          } else {
            console.log("Email sent: " + info.response);
            return res.status(OK).send(
              sendSuccess({
                status: true,
                message: "Reset Password Link Generated",
              })
            );
          }
        });
      } else {
        return res.status(NOTFOUND).send(
          sendError({
            status: false,
            message: responseMessages.NO_USER_FOUND,
          })
        );
      }
    } else {
      return res.status(BADREQUEST).send(
        sendError({
          status: false,
          message: responseMessages.MISSING_FIELD_EMAIL,
        })
      );
    }
  } catch (error) {
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        data: null,
      })
    );
  }
};
export const resetPasswordEmail = async (req, res) => {
  console.log("resetPasswordEmail controller");
  try {
    const { newPassword, confirmNewPassword, token } = req.body;
    if (newPassword && confirmNewPassword && token) {
      const { result } = verify(token, process.env.JWT_SECRET_KEY);
      const userId = result.slice(
        0,
        result.length - process.env.JWT_SECRET_KEY.length
      );
      const user = await Users.findById(userId);
      // return res.send(user)
      if (user) {
        const salt = genSaltSync(10);
        const hashedPassword = hashSync(newPassword, salt);
        await Users.findByIdAndUpdate(userId, {
          $set: { Password: hashedPassword },
        });
        return res.status(OK).send(
          sendSuccess({
            status: true,
            message: "Password Updated Successfully",
          })
        );
      } else {
        return res
          .status(NOTFOUND)
          .send(
            sendError({ status: false, message: responseMessages.NO_USER })
          );
      }
    } else {
      return res
        .status(BADREQUEST)
        .send(
          sendError({ status: false, message: responseMessages.MISSING_FIELDS })
        );
    }
  } catch (error) {
    console.log(error, "error");
    return res.status(INTERNALERROR).send(
      sendError({
        status: false,
        message: error.message,
        data: null,
      })
    );
  }
};